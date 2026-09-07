-- Public journey hardening: OTP verification, voucher issuance, redemption,
-- and the RLS policies required for partner workspaces.

alter table public.claims
  add column if not exists claim_token uuid not null unique default gen_random_uuid(),
  add column if not exists consent_terms boolean not null default false,
  add column if not exists consent_marketing boolean not null default false,
  add column if not exists consent_captured_at timestamptz,
  add column if not exists consent_terms_version text not null default 'v1',
  add column if not exists consent_privacy_version text not null default 'v1';

alter table public.production_batches
  add column if not exists produced_quantity integer,
  add column if not exists delivered_quantity integer,
  add column if not exists damaged_quantity integer not null default 0;

comment on column public.production_batches.quantity is 'Planned quantity at creation.';

alter table public.verification_attempts
  add column if not exists otp_hash text,
  add column if not exists expires_at timestamptz,
  add column if not exists attempt_count integer not null default 0;

-- ---------------------------------------------------------------------------
-- Additional RLS policies for partner workspaces
-- ---------------------------------------------------------------------------

create policy "organizer members read own events" on public.events
  for select using (public.is_member_of(organizer_organization_id));

create policy "organizer members read event venues" on public.event_venues
  for select using (
    exists (
      select 1 from public.events e
      where e.id = event_venues.event_id
        and public.is_member_of(e.organizer_organization_id)
    )
  );

create policy "volunteers read assigned event venues" on public.event_venues
  for select using (
    exists (
      select 1 from public.volunteer_assignments va
      where va.event_venue_id = event_venues.id
        and va.volunteer_user_id = auth.uid()
    )
  );

create policy "volunteers read assigned batches" on public.production_batches
  for select using (
    public.has_kultur_role()
    or exists (
      select 1 from public.volunteer_assignments va
      where va.production_batch_id = production_batches.id
        and va.volunteer_user_id = auth.uid()
    )
  );

create policy "volunteers update own assignments" on public.volunteer_assignments
  for update using (volunteer_user_id = auth.uid())
  with check (volunteer_user_id = auth.uid() and status in ('IN_PROGRESS', 'COMPLETED'));

create policy "venue operators write live updates" on public.venue_live_updates
  for insert with check (
    created_by = auth.uid()
    and exists (
      select 1 from public.events e
      join public.event_venues ev on ev.event_id = e.id
      where ev.id = venue_live_updates.event_venue_id
        and public.is_member_of(e.organizer_organization_id)
    )
  );

-- ---------------------------------------------------------------------------
-- Public claim submission: creates scan session + claim + pending OTP attempt.
-- One claim per (campaign, phone). The caller generates the claim token and
-- only ever stores the salted OTP hash, never the raw code.
-- ---------------------------------------------------------------------------

create or replace function public.submit_public_claim(
  input_batch_code text,
  input_phone_e164 text,
  input_phone_hash text,
  input_claim_token uuid,
  input_otp_hash text,
  input_expires_at timestamptz,
  input_consent_terms boolean default false,
  input_consent_marketing boolean default null,
  input_ip_hash text default null
)
returns table(out_claim_id uuid, out_state text)
language plpgsql security definer set search_path = public as $$
declare
  batch_record public.production_batches;
  activation_record public.campaign_activations;
  campaign_record public.campaigns;
  claim_record public.claims;
  new_scan_session_id uuid;
  phone_attempt_count integer;
  ip_claim_count integer;
begin
  -- Consent to offer terms is required to start a claim.
  if not input_consent_terms then
    return query select null::uuid, 'TERMS_REQUIRED'::text; return;
  end if;

  -- Abuse protection: max 3 OTP sends per phone number per hour.
  select count(*) into phone_attempt_count
  from public.verification_attempts va
  join public.claims c on c.id = va.claim_id
  where c.phone_hash = input_phone_hash
    and va.created_at > now() - interval '1 hour';
  if phone_attempt_count >= 3 then
    return query select null::uuid, 'RATE_LIMITED_PHONE'::text; return;
  end if;

  -- Abuse protection: max 20 claim starts per IP per hour.
  if input_ip_hash is not null then
    select count(*) into ip_claim_count
    from public.scan_sessions
    where ip_hash = input_ip_hash
      and started_at > now() - interval '1 hour'
      and status in ('CLAIM_STARTED', 'CLAIM_COMPLETED');
    if ip_claim_count >= 20 then
      return query select null::uuid, 'RATE_LIMITED_IP'::text; return;
    end if;
  end if;

  select * into batch_record
  from public.production_batches
  where batch_code = input_batch_code and status = 'ACTIVE';
  if not found then
    return query select null::uuid, 'BATCH_NOT_ACTIVE'::text; return;
  end if;

  select * into activation_record
  from public.campaign_activations
  where id = batch_record.campaign_activation_id and status = 'ACTIVE';
  if not found then
    return query select null::uuid, 'ACTIVATION_NOT_ACTIVE'::text; return;
  end if;

  select * into campaign_record
  from public.campaigns
  where id = activation_record.campaign_id and status = 'ACTIVE';
  if not found then
    return query select null::uuid, 'CAMPAIGN_NOT_ACTIVE'::text; return;
  end if;

  select * into claim_record
  from public.claims
  where campaign_id = campaign_record.id and phone_hash = input_phone_hash;

  if found then
    -- PHASE 1 LOCK: one verified phone = one claim per campaign. This is a
    -- hard database rule (unique(campaign_id, phone_hash)); there is no
    -- configurable multi-claim path.
    if claim_record.status not in ('STARTED', 'PHONE_SUBMITTED', 'OTP_SENT', 'FAILED') then
      return query select null::uuid, 'ALREADY_CLAIMED'::text; return;
    end if;

    -- Retry path: rotate the token, replace the pending OTP, keep prior consent.
    update public.claims
    set claim_token = input_claim_token,
        status = 'OTP_SENT',
        verification_status = 'PENDING',
        consent_terms = true,
        consent_marketing = coalesce(input_consent_marketing, consent_marketing),
        consent_captured_at = coalesce(consent_captured_at, now()),
        updated_at = now()
    where id = claim_record.id;

    update public.verification_attempts
    set status = 'FAILED'
    where claim_id = claim_record.id and status = 'PENDING';

    insert into public.verification_attempts (claim_id, provider, status, otp_hash, expires_at)
    values (claim_record.id, 'kultur', 'PENDING', input_otp_hash, input_expires_at);

    insert into public.experience_events (scan_session_id, event_type)
    values (claim_record.scan_session_id, 'OTP_SENT');

    return query select claim_record.id, 'OTP_SENT'::text; return;
  end if;

  insert into public.scan_sessions (production_batch_id, campaign_activation_id, status, ip_hash)
  values (batch_record.id, activation_record.id, 'CLAIM_STARTED', input_ip_hash)
  returning id into new_scan_session_id;

  insert into public.claims (
    campaign_id, production_batch_id, scan_session_id,
    phone_e164, phone_hash, verification_status, status, claim_token, claimed_at,
    consent_terms, consent_marketing, consent_captured_at
  ) values (
    campaign_record.id, batch_record.id, new_scan_session_id,
    input_phone_e164, input_phone_hash, 'PENDING', 'OTP_SENT', input_claim_token, now(),
    input_consent_terms, coalesce(input_consent_marketing, false), now()
  ) returning * into claim_record;

  insert into public.verification_attempts (claim_id, provider, status, otp_hash, expires_at)
  values (claim_record.id, 'kultur', 'PENDING', input_otp_hash, input_expires_at);

  insert into public.experience_events (scan_session_id, event_type)
  values (new_scan_session_id, 'PHONE_SUBMITTED');

  return query select claim_record.id, 'OTP_SENT'::text;
end;
$$;

-- ---------------------------------------------------------------------------
-- OTP verification: validates the salted hash against the latest pending
-- attempt, then issues the voucher inside one transaction.
-- ---------------------------------------------------------------------------

create or replace function public.verify_public_otp(
  input_claim_token uuid,
  input_otp_hash text
)
returns table(out_success boolean, out_message text, out_voucher_code text)
language plpgsql security definer set search_path = public as $$
declare
  claim_record public.claims;
  attempt_record public.verification_attempts;
  campaign_slug text;
  new_code text;
  new_lead_id uuid;
begin
  select * into claim_record from public.claims where claim_token = input_claim_token;
  if not found then
    return query select false, 'Claim session not found. Start again.', null::text; return;
  end if;

  if claim_record.status = 'VOUCHER_ISSUED' then
    return query select false, 'This offer has already been claimed.', null::text; return;
  end if;

  select * into attempt_record
  from public.verification_attempts
  where claim_id = claim_record.id and status = 'PENDING'
  order by created_at desc
  limit 1
  for update;

  if not found or attempt_record.expires_at is null or attempt_record.expires_at < now() then
    return query select false, 'Code expired. Request a new one.', null::text; return;
  end if;

  if attempt_record.attempt_count >= 5 then
    return query select false, 'Too many attempts. Request a new code.', null::text; return;
  end if;

  update public.verification_attempts
  set attempt_count = attempt_count + 1
  where id = attempt_record.id;

  if attempt_record.otp_hash is distinct from input_otp_hash then
    return query select false, 'Incorrect code. Try again.', null::text; return;
  end if;

  update public.verification_attempts set status = 'VERIFIED' where id = attempt_record.id;
  update public.claims
  set verification_status = 'VERIFIED', status = 'VERIFIED', updated_at = now()
  where id = claim_record.id;

  insert into public.experience_events (scan_session_id, event_type)
  values (claim_record.scan_session_id, 'OTP_VERIFIED');

  insert into public.leads (campaign_id, claim_id, phone_e164, phone_hash, consent_marketing, consent_timestamp, source)
  values (claim_record.campaign_id, claim_record.id, claim_record.phone_e164, claim_record.phone_hash, claim_record.consent_marketing, claim_record.consent_captured_at, 'QR_SCAN')
  on conflict (claim_id) do nothing;

  select id into new_lead_id from public.leads where claim_id = claim_record.id;

  select slug into campaign_slug from public.campaigns where id = claim_record.campaign_id;

  loop
    new_code := 'KULTUR-'
      || upper(substring(regexp_replace(coalesce(campaign_slug, 'gn'), '[^a-z0-9]', '', 'g') from 1 for 3))
      || '-'
      || upper(encode(gen_random_bytes(3), 'hex'));
    begin
      insert into public.vouchers (campaign_id, claim_id, lead_id, voucher_code, status)
      values (claim_record.campaign_id, claim_record.id, new_lead_id, new_code, 'ACTIVE');
      exit;
    exception when unique_violation then
      -- Regenerate on the astronomically unlikely collision.
    end;
  end loop;

  update public.claims set status = 'VOUCHER_ISSUED', updated_at = now() where id = claim_record.id;

  insert into public.experience_events (scan_session_id, event_type)
  values (claim_record.scan_session_id, 'CLAIM_COMPLETED');

  update public.scan_sessions
  set status = 'CLAIM_COMPLETED', completed_at = now(), last_seen_at = now()
  where id = claim_record.scan_session_id;

  return query select true, 'Verified'::text, new_code;
end;
$$;

-- ---------------------------------------------------------------------------
-- Public claim status for the voucher display step. Token-gated.
-- ---------------------------------------------------------------------------

create or replace function public.get_public_claim(input_claim_token uuid)
returns table(
  claim_status public.claim_status,
  voucher_code text,
  voucher_status public.voucher_status,
  issued_at timestamptz,
  expires_at timestamptz
)
language sql stable security definer set search_path = public as $$
  select c.status, v.voucher_code, v.status, v.issued_at, v.expires_at
  from public.claims c
  left join public.vouchers v on v.claim_id = c.id
  where c.claim_token = input_claim_token;
$$;

-- ---------------------------------------------------------------------------
-- Voucher redemption: authenticated advertiser staff or Kultur operations.
-- Row-locked so a voucher can never be redeemed twice concurrently.
-- ---------------------------------------------------------------------------

create or replace function public.redeem_voucher(
  input_voucher_code text,
  input_notes text default null
)
returns table(out_success boolean, out_message text, out_redeemed_at timestamptz)
language plpgsql security definer set search_path = public as $$
declare
  voucher_record public.vouchers;
begin
  if auth.uid() is null then
    return query select false, 'Authentication required.', null::timestamptz; return;
  end if;

  select * into voucher_record
  from public.vouchers
  where voucher_code = upper(trim(input_voucher_code))
  for update;

  if not found then
    return query select false, 'Voucher not found.', null::timestamptz; return;
  end if;

  if not (
    public.has_kultur_role()
    or exists (
      select 1 from public.campaigns c
      where c.id = voucher_record.campaign_id
        and public.is_member_of(c.advertiser_organization_id)
    )
  ) then
    return query select false, 'Not authorized for this voucher.', null::timestamptz; return;
  end if;

  if voucher_record.expires_at is not null and voucher_record.expires_at < now() then
    update public.vouchers set status = 'EXPIRED' where id = voucher_record.id;
    return query select false, 'Voucher has expired.', null::timestamptz; return;
  end if;

  if voucher_record.status not in ('ISSUED', 'ACTIVE') then
    return query select false, 'Voucher is already ' || lower(voucher_record.status::text) || '.', null::timestamptz; return;
  end if;

  insert into public.voucher_redemptions (voucher_id, redeemed_by_user_id, redemption_channel, notes)
  values (voucher_record.id, auth.uid(), 'PARTNER_DASHBOARD', input_notes);

  update public.vouchers set status = 'REDEEMED', redeemed_at = now() where id = voucher_record.id;

  return query select true, 'Voucher redeemed.'::text, now();
end;
$$;

revoke all on function public.submit_public_claim(text, text, text, uuid, text, timestamptz, boolean, boolean, text) from public;
revoke all on function public.verify_public_otp(uuid, text) from public;
revoke all on function public.get_public_claim(uuid) from public;
revoke all on function public.redeem_voucher(text, text) from public;

grant execute on function public.submit_public_claim(text, text, text, uuid, text, timestamptz, boolean, boolean, text) to anon, authenticated;
grant execute on function public.verify_public_otp(uuid, text) to anon, authenticated;
grant execute on function public.get_public_claim(uuid) to anon, authenticated;
grant execute on function public.redeem_voucher(text, text) to authenticated;
