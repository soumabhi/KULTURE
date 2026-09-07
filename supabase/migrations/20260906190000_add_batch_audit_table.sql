-- Audit table for manual batch adjustments
create table if not exists public.batch_adjustments (
  id uuid primary key default gen_random_uuid(),
  production_batch_id uuid not null references public.production_batches(id),
  adjusted_by uuid references auth.users(id),
  old_distributed integer not null,
  old_reserved integer not null,
  old_redeemed integer not null,
  new_distributed integer not null,
  new_reserved integer not null,
  new_redeemed integer not null,
  reason text,
  created_at timestamptz not null default now()
);

grant insert on public.batch_adjustments to authenticated;
