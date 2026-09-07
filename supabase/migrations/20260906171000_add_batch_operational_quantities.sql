-- Add operational quantity columns to production_batches
alter table public.production_batches
  add column distributed_quantity integer not null default 0 check (distributed_quantity >= 0),
  add column reserved_quantity integer not null default 0 check (reserved_quantity >= 0),
  add column redeemed_quantity integer not null default 0 check (redeemed_quantity >= 0);

-- Ensure distributed + redeemed + reserved never exceeds planned quantity
create or replace function public.production_batches_check_quantities()
returns trigger language plpgsql as $$
begin
  if (new.distributed_quantity + new.reserved_quantity + new.redeemed_quantity) > new.quantity then
    raise exception 'batch quantities exceed planned quantity (%): distributed % + reserved % + redeemed % > planned %',
      new.id, new.distributed_quantity, new.reserved_quantity, new.redeemed_quantity, new.quantity;
  end if;
  return new;
end;
$$;

create trigger production_batches_check_quantities_trg
  before insert or update on public.production_batches
  for each row execute function public.production_batches_check_quantities();

comment on column public.production_batches.distributed_quantity is 'Number of items distributed to field/volunteers.';
comment on column public.production_batches.reserved_quantity is 'Number of items reserved (held back) for on-site or partner redemption.';
comment on column public.production_batches.redeemed_quantity is 'Number of items redeemed by users (vouchers redeemed).';
