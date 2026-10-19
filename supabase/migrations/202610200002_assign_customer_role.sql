-- إسناد دور العميل تلقائياً للحساب الجديد دون أي مسار ذاتي لمنح دور الإدارة
begin;
create or replace function public.assign_customer_role_on_signup()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  customer_role_id smallint;
begin
  select id into customer_role_id from public.roles where code = 'customer' limit 1;
  if customer_role_id is not null then
    insert into public.user_roles (user_id, role_id)
    values (new.id, customer_role_id)
    on conflict (user_id, role_id) do nothing;
  end if;
  return new;
end;
$$;
revoke all on function public.assign_customer_role_on_signup() from public, anon, authenticated;
drop trigger if exists on_auth_user_created_customer_role on auth.users;
create trigger on_auth_user_created_customer_role
after insert on auth.users
for each row execute function public.assign_customer_role_on_signup();
commit;