create extension if not exists pgcrypto;

create type public.organization_type as enum ('KULTUR', 'ADVERTISER', 'VENUE_ORGANIZER');
create type public.organization_role as enum (
  'KULTUR_OWNER', 'KULTUR_ADMIN', 'KULTUR_OPERATOR', 'KULTUR_VOLUNTEER',
  'ADVERTISER_ADMIN', 'ADVERTISER_VIEWER', 'VENUE_ADMIN', 'VENUE_OPERATOR'
);
create type public.record_status as enum ('ACTIVE', 'INACTIVE', 'PAUSED', 'ARCHIVED');
create type public.campaign_status as enum ('DRAFT', 'PLANNED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');
create type public.batch_status as enum ('PLANNED', 'PRINTING', 'READY', 'DELIVERED', 'ACTIVE', 'PAUSED', 'EXHAUSTED', 'CLOSED');
create type public.assignment_status as enum ('ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
create type public.delivery_status as enum ('PENDING', 'CONFIRMED', 'REJECTED');
create type public.scan_status as enum ('STARTED', 'ENGAGED', 'GAME_COMPLETED', 'CLAIM_STARTED', 'CLAIM_COMPLETED', 'ABANDONED');
create type public.claim_status as enum ('STARTED', 'PHONE_SUBMITTED', 'OTP_SENT', 'VERIFIED', 'VOUCHER_ISSUED', 'FAILED');
create type public.verification_status as enum ('PENDING', 'VERIFIED', 'FAILED');
create type public.voucher_status as enum ('ISSUED', 'ACTIVE', 'REDEEMED', 'EXPIRED', 'CANCELLED');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(trim(full_name)) between 1 and 160),
  email text,
  phone text,
  avatar_url text,
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  organization_type public.organization_type not null,
  logo_url text,
  email text,
  phone text,
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.organization_role not null,
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  organizer_organization_id uuid not null references public.organizations(id),
  name text not null check (char_length(trim(name)) between 1 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  event_type text not null default 'GANESH_PUJA' check (event_type = 'GANESH_PUJA'),
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz not null check (ends_at > starts_at),
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.venues (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  address text not null,
  city text not null,
  state text not null,
  country text not null default 'India',
  latitude numeric(9,6),
  longitude numeric(9,6),
  geo_radius_meters integer check (geo_radius_meters is null or geo_radius_meters > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (latitude is null or latitude between -90 and 90),
  check (longitude is null or longitude between -180 and 180)
);

create table public.event_venues (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  venue_id uuid not null references public.venues(id),
  label text not null check (char_length(trim(label)) between 1 and 120),
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  unique (event_id, venue_id, label)
);
create unique index event_venues_one_primary_per_event on public.event_venues(event_id) where is_primary;

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  kultur_organization_id uuid not null references public.organizations(id),
  advertiser_organization_id uuid not null references public.organizations(id),
  name text not null check (char_length(trim(name)) between 1 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text,
  status public.campaign_status not null default 'DRAFT',
  starts_at timestamptz not null,
  ends_at timestamptz not null check (ends_at > starts_at),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (kultur_organization_id <> advertiser_organization_id)
);

create table public.campaign_configs (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null unique references public.campaigns(id) on delete cascade,
  title text,
  subtitle text,
  sponsor_name text,
  sponsor_logo_url text,
  hero_image_url text,
  theme_config jsonb not null default '{}'::jsonb,
  experience_type text not null default 'GANESH_PUJA' check (experience_type = 'GANESH_PUJA'),
  game_type text not null default 'CATCH_MODAK' check (game_type = 'CATCH_MODAK'),
  reward_config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.campaign_rewards (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  name text not null,
  description text,
  reward_type text not null,
  terms text,
  valid_from timestamptz,
  valid_until timestamptz,
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  check (valid_until is null or valid_from is null or valid_until > valid_from)
);

create table public.campaign_activations (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  event_id uuid not null references public.events(id),
  event_venue_id uuid not null references public.event_venues(id),
  name text not null,
  status public.record_status not null default 'ACTIVE',
  starts_at timestamptz not null,
  ends_at timestamptz not null check (ends_at > starts_at),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.production_batches (
  id uuid primary key default gen_random_uuid(),
  campaign_activation_id uuid not null references public.campaign_activations(id) on delete cascade,
  batch_code text not null unique check (batch_code ~ '^[A-Z0-9-]{4,80}$'),
  quantity integer not null check (quantity > 0),
  qr_token uuid not null unique default gen_random_uuid(),
  status public.batch_status not null default 'PLANNED',
  printed_at timestamptz,
  activated_at timestamptz,
  distributed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.volunteer_assignments (
  id uuid primary key default gen_random_uuid(),
  volunteer_user_id uuid not null references public.profiles(id),
  production_batch_id uuid not null references public.production_batches(id),
  event_venue_id uuid not null references public.event_venues(id),
  task_type text not null check (task_type in ('DELIVERY', 'SETUP', 'RESUPPLY')),
  status public.assignment_status not null default 'ASSIGNED',
  assigned_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  check (completed_at is null or completed_at >= assigned_at)
);

create table public.batch_deliveries (
  id uuid primary key default gen_random_uuid(),
  production_batch_id uuid not null references public.production_batches(id),
  delivered_by uuid not null references public.profiles(id),
  latitude numeric(9,6),
  longitude numeric(9,6),
  delivered_at timestamptz not null default now(),
  notes text,
  status public.delivery_status not null default 'PENDING',
  created_at timestamptz not null default now(),
  check (latitude is null or latitude between -90 and 90),
  check (longitude is null or longitude between -180 and 180)
);

create table public.scan_sessions (
  id uuid primary key default gen_random_uuid(),
  production_batch_id uuid not null references public.production_batches(id),
  campaign_activation_id uuid not null references public.campaign_activations(id),
  started_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  completed_at timestamptz,
  user_agent text,
  referrer text,
  ip_hash text,
  status public.scan_status not null default 'STARTED',
  check (completed_at is null or completed_at >= started_at)
);

create table public.experience_events (
  id uuid primary key default gen_random_uuid(),
  scan_session_id uuid not null references public.scan_sessions(id) on delete cascade,
  event_type text not null check (event_type in ('PAGE_VIEWED', 'GAME_STARTED', 'GAME_COMPLETED', 'REWARD_OPENED', 'PHONE_SUBMITTED', 'OTP_SENT', 'OTP_VERIFIED', 'CLAIM_COMPLETED')),
  event_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.claims (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id),
  production_batch_id uuid not null references public.production_batches(id),
  scan_session_id uuid not null references public.scan_sessions(id),
  phone_e164 text not null check (phone_e164 ~ '^\+[1-9][0-9]{7,14}$'),
  phone_hash text not null,
  verification_status public.verification_status not null default 'PENDING',
  status public.claim_status not null default 'STARTED',
  claimed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (campaign_id, phone_hash)
);

create table public.verification_attempts (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references public.claims(id) on delete cascade,
  provider text not null,
  provider_reference text,
  status public.verification_status not null default 'PENDING',
  created_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id),
  claim_id uuid not null unique references public.claims(id),
  phone_e164 text not null check (phone_e164 ~ '^\+[1-9][0-9]{7,14}$'),
  phone_hash text not null,
  consent_marketing boolean not null default false,
  consent_timestamp timestamptz,
  source text not null default 'QR_SCAN',
  created_at timestamptz not null default now(),
  check ((consent_marketing and consent_timestamp is not null) or (not consent_marketing))
);

create table public.vouchers (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id),
  claim_id uuid not null unique references public.claims(id),
  lead_id uuid references public.leads(id),
  voucher_code text not null unique,
  status public.voucher_status not null default 'ISSUED',
  issued_at timestamptz not null default now(),
  expires_at timestamptz,
  redeemed_at timestamptz,
  created_at timestamptz not null default now(),
  check (expires_at is null or expires_at > issued_at)
);

create table public.voucher_redemptions (
  id uuid primary key default gen_random_uuid(),
  voucher_id uuid not null unique references public.vouchers(id),
  redeemed_by_user_id uuid references public.profiles(id),
  redemption_channel text not null check (redemption_channel in ('PARTNER_DASHBOARD', 'API', 'MANUAL')),
  redeemed_at timestamptz not null default now(),
  notes text
);

create table public.venue_live_updates (
  id uuid primary key default gen_random_uuid(),
  event_venue_id uuid not null references public.event_venues(id) on delete cascade,
  update_type text not null check (update_type in ('CROWD_STATUS', 'ANNOUNCEMENT', 'RESUPPLY_ALERT')),
  title text not null,
  message text,
  priority text not null default 'NORMAL' check (priority in ('NORMAL', 'HIGH')),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  check (ends_at is null or ends_at > starts_at)
);

create index organization_members_user_id_idx on public.organization_members(user_id);
create index events_organizer_organization_id_idx on public.events(organizer_organization_id);
create index campaign_activations_campaign_id_idx on public.campaign_activations(campaign_id);
create index production_batches_activation_id_idx on public.production_batches(campaign_activation_id);
create index scan_sessions_batch_id_idx on public.scan_sessions(production_batch_id);
create index scan_sessions_activation_id_idx on public.scan_sessions(campaign_activation_id);
create index claims_campaign_id_idx on public.claims(campaign_id);
create index leads_campaign_id_idx on public.leads(campaign_id);
create index vouchers_campaign_id_idx on public.vouchers(campaign_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_member_of(target_organization_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.organization_members
    where user_id = auth.uid()
      and organization_id = target_organization_id
      and status = 'ACTIVE'
  );
$$;

create or replace function public.has_kultur_role()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.organization_members
    join public.organizations on organizations.id = organization_members.organization_id
    where organization_members.user_id = auth.uid()
      and organization_members.status = 'ACTIVE'
      and organizations.organization_type = 'KULTUR'
      and organization_members.role in ('KULTUR_OWNER', 'KULTUR_ADMIN', 'KULTUR_OPERATOR')
  );
$$;

create or replace function public.public_scan_context(input_batch_code text)
returns table (
  batch_code text,
  batch_status public.batch_status,
  campaign_name text,
  campaign_status public.campaign_status,
  title text,
  subtitle text,
  sponsor_name text,
  experience_type text,
  game_type text
) language sql stable security definer set search_path = public as $$
  select pb.batch_code, pb.status, c.name, c.status, cc.title, cc.subtitle,
    cc.sponsor_name, cc.experience_type, cc.game_type
  from public.production_batches pb
  join public.campaign_activations ca on ca.id = pb.campaign_activation_id
  join public.campaigns c on c.id = ca.campaign_id
  left join public.campaign_configs cc on cc.campaign_id = c.id
  where pb.batch_code = input_batch_code
    and pb.status = 'ACTIVE'
    and ca.status = 'ACTIVE'
    and c.status = 'ACTIVE';
$$;

revoke all on function public.public_scan_context(text) from public;
grant execute on function public.public_scan_context(text) to anon, authenticated;

create or replace function public.start_public_scan(input_batch_code text, input_user_agent text default null, input_referrer text default null, input_ip_hash text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  batch_record public.production_batches;
  activation_record public.campaign_activations;
  campaign_record public.campaigns;
  scan_session_id uuid;
  ip_scan_count integer;
begin
  -- Abuse protection: max 60 scan sessions per IP per hour (shared networks
  -- at festivals make stricter limits risky; claim-level limits are tighter).
  if input_ip_hash is not null then
    select count(*) into ip_scan_count
    from public.scan_sessions
    where ip_hash = input_ip_hash
      and started_at > now() - interval '1 hour';
    if ip_scan_count >= 60 then
      return null;
    end if;
  end if;

  select * into batch_record from public.production_batches where batch_code = input_batch_code and status = 'ACTIVE';
  if not found then raise exception 'Active production batch not found'; end if;
  select * into activation_record from public.campaign_activations where id = batch_record.campaign_activation_id and status = 'ACTIVE';
  if not found then raise exception 'Active campaign activation not found'; end if;
  select * into campaign_record from public.campaigns where id = activation_record.campaign_id and status = 'ACTIVE';
  if not found then raise exception 'Active campaign not found'; end if;
  insert into public.scan_sessions (production_batch_id, campaign_activation_id, user_agent, referrer, ip_hash, status)
  values (batch_record.id, activation_record.id, input_user_agent, input_referrer, input_ip_hash, 'STARTED')
  returning id into scan_session_id;
  insert into public.experience_events (scan_session_id, event_type) values (scan_session_id, 'PAGE_VIEWED');
  return scan_session_id;
end;
$$;

create or replace function public.record_public_experience_event(input_scan_session_id uuid, input_event_type text, input_event_data jsonb default '{}'::jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  if input_event_type not in ('GAME_STARTED', 'GAME_COMPLETED', 'REWARD_OPENED', 'PHONE_SUBMITTED', 'OTP_SENT') then
    raise exception 'Unsupported public experience event';
  end if;
  if not exists (select 1 from public.scan_sessions where id = input_scan_session_id) then
    raise exception 'Scan session not found';
  end if;
  insert into public.experience_events (scan_session_id, event_type, event_data) values (input_scan_session_id, input_event_type, input_event_data);
  update public.scan_sessions set last_seen_at = now(), status = case when input_event_type = 'GAME_COMPLETED' then 'GAME_COMPLETED' else status end where id = input_scan_session_id;
end;
$$;

revoke all on function public.start_public_scan(text, text, text, text) from public;
revoke all on function public.record_public_experience_event(uuid, text, jsonb) from public;
grant execute on function public.start_public_scan(text, text, text, text) to anon, authenticated;
grant execute on function public.record_public_experience_event(uuid, text, jsonb) to anon, authenticated;

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'profiles', 'organizations', 'organization_members', 'events', 'venues', 'event_venues',
    'campaigns', 'campaign_configs', 'campaign_rewards', 'campaign_activations',
    'production_batches', 'volunteer_assignments', 'batch_deliveries', 'scan_sessions',
    'experience_events', 'claims', 'verification_attempts', 'leads', 'vouchers',
    'voucher_redemptions', 'venue_live_updates'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
  end loop;
end;
$$;

create policy "profiles read own" on public.profiles for select using (id = auth.uid());
create policy "members read own memberships" on public.organization_members for select using (user_id = auth.uid() or public.has_kultur_role());
create policy "organizations visible to members" on public.organizations for select using (public.is_member_of(id) or public.has_kultur_role());
create policy "kultur manages organizations" on public.organizations for all using (public.has_kultur_role()) with check (public.has_kultur_role());
create policy "kultur manages events" on public.events for all using (public.has_kultur_role()) with check (public.has_kultur_role());
create policy "kultur manages venues" on public.venues for all using (public.has_kultur_role()) with check (public.has_kultur_role());
create policy "kultur manages event venues" on public.event_venues for all using (public.has_kultur_role()) with check (public.has_kultur_role());
create policy "campaign access by tenant" on public.campaigns for select using (public.has_kultur_role() or public.is_member_of(advertiser_organization_id));
create policy "kultur manages campaigns" on public.campaigns for all using (public.has_kultur_role()) with check (public.has_kultur_role());
create policy "kultur manages campaign configs" on public.campaign_configs for all using (public.has_kultur_role()) with check (public.has_kultur_role());
create policy "kultur manages campaign rewards" on public.campaign_rewards for all using (public.has_kultur_role()) with check (public.has_kultur_role());
create policy "kultur manages activations" on public.campaign_activations for all using (public.has_kultur_role()) with check (public.has_kultur_role());
create policy "kultur manages batches" on public.production_batches for all using (public.has_kultur_role()) with check (public.has_kultur_role());
create policy "volunteers view own assignments" on public.volunteer_assignments for select using (volunteer_user_id = auth.uid() or public.has_kultur_role());
create policy "kultur manages assignments" on public.volunteer_assignments for all using (public.has_kultur_role()) with check (public.has_kultur_role());
create policy "delivery participant access" on public.batch_deliveries for select using (delivered_by = auth.uid() or public.has_kultur_role());
create policy "delivery participant inserts" on public.batch_deliveries for insert with check (delivered_by = auth.uid() or public.has_kultur_role());
create policy "kultur manages scan sessions" on public.scan_sessions for all using (public.has_kultur_role()) with check (public.has_kultur_role());
create policy "kultur reads experience events" on public.experience_events for select using (public.has_kultur_role());
create policy "campaign tenant reads claims" on public.claims for select using (public.has_kultur_role() or exists (select 1 from public.campaigns c where c.id = campaign_id and public.is_member_of(c.advertiser_organization_id)));
create policy "advertisers read consented leads" on public.leads for select using (public.has_kultur_role() or (consent_marketing and exists (select 1 from public.campaigns c where c.id = campaign_id and public.is_member_of(c.advertiser_organization_id))));
create policy "campaign tenant reads vouchers" on public.vouchers for select using (public.has_kultur_role() or exists (select 1 from public.campaigns c where c.id = campaign_id and public.is_member_of(c.advertiser_organization_id)));
create policy "advertiser redeems vouchers" on public.voucher_redemptions for insert with check (redeemed_by_user_id = auth.uid());
create policy "venue operators read live updates" on public.venue_live_updates for select using (public.has_kultur_role() or exists (select 1 from public.events e join public.event_venues ev on ev.event_id = e.id where ev.id = event_venue_id and public.is_member_of(e.organizer_organization_id)));

create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger organizations_set_updated_at before update on public.organizations for each row execute function public.set_updated_at();
create trigger organization_members_set_updated_at before update on public.organization_members for each row execute function public.set_updated_at();
create trigger events_set_updated_at before update on public.events for each row execute function public.set_updated_at();
create trigger venues_set_updated_at before update on public.venues for each row execute function public.set_updated_at();
create trigger campaigns_set_updated_at before update on public.campaigns for each row execute function public.set_updated_at();
create trigger campaign_configs_set_updated_at before update on public.campaign_configs for each row execute function public.set_updated_at();
create trigger campaign_activations_set_updated_at before update on public.campaign_activations for each row execute function public.set_updated_at();
create trigger production_batches_set_updated_at before update on public.production_batches for each row execute function public.set_updated_at();
create trigger claims_set_updated_at before update on public.claims for each row execute function public.set_updated_at();
