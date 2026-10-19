-- تقوية صلاحيات الدوال وإضافة فهارس للمفاتيح الخارجية
begin;
revoke execute on function public.guard_booking_status_change() from public, anon, authenticated;
revoke execute on function public.handle_new_user_profile() from public, anon, authenticated;
create index if not exists user_roles_role_id_idx on public.user_roles(role_id);
create index if not exists user_roles_assigned_by_idx on public.user_roles(assigned_by);
create index if not exists booking_status_history_changed_by_idx on public.booking_status_history(changed_by);
create index if not exists contact_messages_user_id_idx on public.contact_messages(user_id);
create index if not exists site_settings_updated_by_idx on public.site_settings(updated_by);
create index if not exists static_pages_updated_by_idx on public.static_pages(updated_by);
commit;