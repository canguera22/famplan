create table public.whatsapp_pairing_codes (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  code text not null unique check (code ~ '^[A-F0-9]{6}$'),
  created_by uuid not null references public.profiles(id),
  expires_at timestamptz not null default (now() + interval '15 minutes'),
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.whatsapp_identities (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  whatsapp_address text not null unique check (whatsapp_address like 'whatsapp:+%'),
  display_phone text not null,
  profile_name text,
  active boolean not null default true,
  linked_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (family_id, person_id)
);

create table public.whatsapp_messages (
  message_sid text primary key,
  family_id uuid references public.families(id) on delete cascade,
  identity_id uuid references public.whatsapp_identities(id) on delete set null,
  direction text not null check (direction in ('inbound', 'outbound')),
  body text not null default '',
  status text not null default 'received',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index whatsapp_pairing_codes_lookup_idx
  on public.whatsapp_pairing_codes (code, expires_at)
  where used_at is null;
create index whatsapp_messages_family_created_idx
  on public.whatsapp_messages (family_id, created_at desc)
  where family_id is not null;

create trigger whatsapp_identities_updated_at before update on public.whatsapp_identities
  for each row execute procedure private.set_updated_at();

alter table public.whatsapp_pairing_codes enable row level security;
alter table public.whatsapp_identities enable row level security;
alter table public.whatsapp_messages enable row level security;

create policy "whatsapp_pairing_codes_family_select" on public.whatsapp_pairing_codes
  for select to authenticated
  using ((select private.is_family_member(family_id)));
create policy "whatsapp_pairing_codes_family_delete" on public.whatsapp_pairing_codes
  for delete to authenticated
  using ((select private.is_family_member(family_id)));

create policy "whatsapp_identities_family_select" on public.whatsapp_identities
  for select to authenticated
  using ((select private.is_family_member(family_id)));
create policy "whatsapp_identities_family_delete" on public.whatsapp_identities
  for delete to authenticated
  using (
    (select private.is_family_owner(family_id))
    or exists (
      select 1 from public.people p
      where p.id = person_id and p.user_id = (select auth.uid())
    )
  );

create policy "whatsapp_messages_family_select" on public.whatsapp_messages
  for select to authenticated
  using (family_id is not null and (select private.is_family_member(family_id)));

create or replace function public.create_whatsapp_pairing_code(target_person_id uuid)
returns table (code text, expires_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_person public.people%rowtype;
  next_code text;
  next_expiry timestamptz := now() + interval '15 minutes';
begin
  select * into target_person
  from public.people
  where id = target_person_id and active = true;

  if not found or not (select private.is_family_member(target_person.family_id)) then
    raise exception 'Person not found in your family.';
  end if;

  if target_person.user_id is distinct from (select auth.uid())
     and not (select private.is_family_owner(target_person.family_id)) then
    raise exception 'Only the family owner can connect WhatsApp for another person.';
  end if;

  delete from public.whatsapp_pairing_codes
  where person_id = target_person_id and used_at is null;

  loop
    next_code := upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 6));
    exit when not exists (
      select 1 from public.whatsapp_pairing_codes existing where existing.code = next_code
    );
  end loop;

  insert into public.whatsapp_pairing_codes (
    family_id, person_id, code, created_by, expires_at
  ) values (
    target_person.family_id, target_person.id, next_code, (select auth.uid()), next_expiry
  );

  return query select next_code, next_expiry;
end;
$$;

revoke all on function public.create_whatsapp_pairing_code(uuid) from public;
grant execute on function public.create_whatsapp_pairing_code(uuid) to authenticated;
