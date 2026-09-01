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
    next_code := upper(substr(encode(extensions.gen_random_bytes(4), 'hex'), 1, 6));
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
