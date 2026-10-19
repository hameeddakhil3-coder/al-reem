-- مخطط تأسيسي أولي لمنصة AL Reem
-- هذا الملف يعرّف بنية قاعدة البيانات والسياسات فقط؛ لا ينشئ مشروع Supabase ولا يطبّق نفسه تلقائياً.
-- يجب مراجعة هذا الترحيل واختباره في بيئة تطوير منفصلة قبل تطبيقه على أي قاعدة بيانات.

begin;

-- =========================================================
-- 1) الأدوار والصلاحيات
-- =========================================================

-- الأدوار لا يختارها المستخدم من واجهة التسجيل؛ تُمنح الصلاحيات الإدارية بإجراء موثوق خارج الواجهة.
create table if not exists public.roles (
  id smallint generated always as identity primary key,
  code text not null unique,
  display_name_ar text not null,
  description_ar text,
  created_at timestamptz not null default now(),
  constraint roles_code_format check (code ~ '^[a-z][a-z0-9_]{1,39}$')
);

comment on table public.roles is 'تعريف أدوار المنصة؛ لا تسمح للمستخدم بتعيين دور إداري لنفسه.';
comment on column public.roles.code is 'معرّف ثابت للدور تستخدمه سياسات الصلاحيات.';

create table if not exists public.role_permissions (
  role_id smallint not null references public.roles(id) on delete cascade,
  permission_code text not null,
  description_ar text,
  created_at timestamptz not null default now(),
  primary key (role_id, permission_code)
);

comment on table public.role_permissions is 'الصلاحيات المرتبطة بكل دور، وتُدار حصراً من خلال مسؤول مخوّل.';

-- ربط المستخدمين بأدوارهم في جدول منفصل، وليس في بيانات يحررها المستخدم بنفسه.
create table if not exists public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id smallint not null references public.roles(id) on delete restrict,
  assigned_at timestamptz not null default now(),
  assigned_by uuid references auth.users(id) on delete set null,
  primary key (user_id, role_id)
);

comment on table public.user_roles is 'إسناد الأدوار إلى حسابات المصادقة؛ يجب ألا يملك المستخدم صلاحية تعديل هذا الجدول.';

-- دالة مساعدة محمية للتحقق من دور المسؤول دون الاعتماد على قيمة يرسلها المتصفح.
create or replace function public.has_role(required_role text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = (select auth.uid())
      and r.code = required_role
  );
$$;

comment on function public.has_role(text) is 'تتحقق من دور المستخدم الحالي من جدول محمي؛ لا تقرأ الدور من مدخلات الواجهة.';

revoke all on function public.has_role(text) from public;
-- تستخدم سياسات المحتوى العامة هذه الدالة أيضاً؛ تنفيذها للزائر آمن لأنها تقرأ auth.uid() فقط وتعيد true/false.
grant execute on function public.has_role(text) to anon, authenticated;

-- =========================================================
-- 2) الملفات الشخصية
-- =========================================================

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  preferred_language text not null default 'ar'
    check (preferred_language in ('ar', 'en')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'بيانات الملف الشخصي غير السرية المرتبطة بحساب Supabase Auth؛ لا تخزن كلمات المرور هنا.';

-- إنشاء ملف شخصي أساسي تلقائياً عند تسجيل حساب جديد.
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, full_name)
  values (
    new.id,
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), '')
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

comment on function public.handle_new_user_profile() is 'تنشئ ملفاً شخصياً فارغاً عند إنشاء مستخدم Auth؛ لا تمنح أدواراً إدارية.';
drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function public.handle_new_user_profile();

-- =========================================================
-- 3) طلبات الحجز والمسافرون والرحلات
-- =========================================================

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null unique,
  user_id uuid not null references auth.users(id) on delete restrict,
  status text not null default 'new'
    check (status in (
      'new', 'under_review', 'awaiting_information', 'awaiting_payment',
      'awaiting_confirmation', 'confirmed', 'rejected', 'cancelled'
    )),
  trip_type text not null check (trip_type in ('one_way', 'round_trip')),
  origin_code text,
  origin_label text not null,
  destination_code text,
  destination_label text not null,
  departure_date date not null,
  return_date date,
  cabin_class text not null default 'economy'
    check (cabin_class in ('economy', 'premium_economy', 'business', 'first')),
  adults_count smallint not null default 1 check (adults_count between 1 and 9),
  children_count smallint not null default 0 check (children_count between 0 and 8),
  infants_count smallint not null default 0 check (infants_count between 0 and 8),
  customer_note text,
  admin_notes text,
  preferred_language text not null default 'ar'
    check (preferred_language in ('ar', 'en')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_distinct_cities check (
    lower(trim(origin_label)) <> lower(trim(destination_label))
  ),
  constraint bookings_valid_dates check (
    (trip_type = 'one_way' and return_date is null)
    or
    (trip_type = 'round_trip' and return_date is not null and return_date >= departure_date)
  )
);

comment on table public.bookings is 'طلب حجز يخضع لمراجعة بشرية؛ إنشاء الطلب لا يعني إصدار تذكرة أو تأكيد الحجز.';
comment on column public.bookings.reference_code is 'رقم مرجعي فريد يُولّد بطريقة موثوقة من الخادم قبل إنشاء الطلب.';

// يولّد الخادم الرقم المرجعي بنفسه حتى لا يستطيع العميل فرض رقم أو انتحال رقم حجز آخر.
create or replace function public.generate_booking_reference_code()
returns trigger
language plpgsql
set search_path = ''
as $
begin
  new.reference_code := 'AR-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
  return new;
end;
$;

comment on function public.generate_booking_reference_code() is 'ينشئ رقماً مرجعياً للحجز داخل قاعدة البيانات بدلاً من قبول قيمة يرسلها المتصفح.';
drop trigger if exists bookings_generate_reference_code on public.bookings;
create trigger bookings_generate_reference_code
before insert on public.bookings
for each row execute function public.generate_booking_reference_code();
comment on column public.bookings.admin_notes is 'ملاحظات داخلية للإدارة لا يجوز كشفها للمستخدم.';
comment on column public.bookings.status is 'الحالة الحالية للطلب؛ يجب أن تمر التغييرات عبر منطق خادمي يتحقق من انتقال الحالة ويسجل التاريخ.';

create index if not exists bookings_user_created_idx
  on public.bookings (user_id, created_at desc);
create index if not exists bookings_status_created_idx
  on public.bookings (status, created_at desc);

create table if not exists public.booking_travelers (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  traveler_type text not null check (traveler_type in ('adult', 'child', 'infant')),
  given_name text not null,
  family_name text not null,
  date_of_birth date,
  nationality_code text,
  created_at timestamptz not null default now()
);

comment on table public.booking_travelers is 'بيانات المسافرين اللازمة لمعالجة الطلب؛ تعامل معها كبيانات شخصية ولا تجمع إلا ما يلزم.';
create index if not exists booking_travelers_booking_idx
  on public.booking_travelers (booking_id);

create table if not exists public.booking_flights (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  segment_order smallint not null check (segment_order > 0),
  provider_code text,
  external_flight_id text,
  airline_name text,
  flight_number text,
  origin_code text,
  origin_label text,
  destination_code text,
  destination_label text,
  departure_at timestamptz,
  arrival_at timestamptz,
  baggage_summary text,
  currency_code char(3),
  quoted_price numeric(12,2) check (quoted_price is null or quoted_price >= 0),
  quote_captured_at timestamptz,
  created_at timestamptz not null default now(),
  unique (booking_id, segment_order)
);

comment on table public.booking_flights is 'لقطة من تفاصيل الرحلة المرتبطة بطلب بعينه؛ ليست قاعدة بيانات لجميع الرحلات العالمية ولا تضمن السعر الحالي.';
create index if not exists booking_flights_booking_idx
  on public.booking_flights (booking_id, segment_order);

create table if not exists public.booking_status_history (
  id bigint generated always as identity primary key,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  previous_status text,
  new_status text not null
    check (new_status in (
      'new', 'under_review', 'awaiting_information', 'awaiting_payment',
      'awaiting_confirmation', 'confirmed', 'rejected', 'cancelled'
    )),
  changed_by uuid references auth.users(id) on delete set null,
  change_note text,
  changed_at timestamptz not null default now()
);

comment on table public.booking_status_history is 'سجل تدقيق لتغير حالات الحجز؛ ينبغي أن تُسجّل الحالة والتاريخ في معاملة واحدة.';
create index if not exists booking_status_history_booking_time_idx
  on public.booking_status_history (booking_id, changed_at desc);

-- يمنع هذا المشغّل تغيير الحالة مباشرةً من الواجهة أو تجاوز سجل التاريخ.
-- يسمح بتغيير الحالة للمسؤول فقط، ويتحقق من الانتقالات المحددة ويسجلها ضمن المعاملة نفسها.
create or replace function public.guard_booking_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $
declare
  transition_allowed boolean := false;
begin
  if new.status is distinct from old.status then
    if not public.has_role('admin') then
      raise exception 'Only an authorized administrator can change booking status';
    end if;

    transition_allowed := case old.status
      when 'new' then new.status in ('under_review', 'awaiting_information', 'rejected', 'cancelled')
      when 'under_review' then new.status in ('awaiting_information', 'awaiting_payment', 'awaiting_confirmation', 'confirmed', 'rejected', 'cancelled')
      when 'awaiting_information' then new.status in ('under_review', 'awaiting_payment', 'awaiting_confirmation', 'rejected', 'cancelled')
      when 'awaiting_payment' then new.status in ('under_review', 'awaiting_confirmation', 'rejected', 'cancelled')
      when 'awaiting_confirmation' then new.status in ('under_review', 'confirmed', 'rejected', 'cancelled')
      when 'confirmed' then new.status in ('cancelled')
      when 'rejected' then false
      when 'cancelled' then false
      else false
    end;

    if not transition_allowed then
      raise exception 'Invalid booking status transition: % -> %', old.status, new.status;
    end if;

    insert into public.booking_status_history (
      booking_id, previous_status, new_status, changed_by, change_note
    ) values (
      old.id, old.status, new.status, (select auth.uid()), 'تم تسجيل التغيير تلقائياً بواسطة قاعدة البيانات'
    );
  end if;

  return new;
end;
$;

comment on function public.guard_booking_status_change() is 'يتحقق من انتقالات حالة الحجز ويسجل سجل التاريخ تلقائياً داخل المعاملة نفسها.';
drop trigger if exists bookings_guard_status_change on public.bookings;
create trigger bookings_guard_status_change
before update of status on public.bookings
for each row execute function public.guard_booking_status_change();

-- تحديث updated_at تلقائياً عند تعديل الصف، لتوحيد السلوك بين الواجهة والإدارة.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $
begin
  new.updated_at = now();
  return new;
end;
$;

comment on function public.set_updated_at() is 'يضبط وقت التحديث تلقائياً عند تعديل السجل، بدلاً من الاعتماد على ساعة المتصفح.';

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger bookings_set_updated_at before update on public.bookings
for each row execute function public.set_updated_at();
create trigger payments_set_updated_at before update on public.payments
for each row execute function public.set_updated_at();
create trigger destinations_set_updated_at before update on public.destinations
for each row execute function public.set_updated_at();
create trigger banners_set_updated_at before update on public.banners
for each row execute function public.set_updated_at();
create trigger homepage_sections_set_updated_at before update on public.homepage_sections
for each row execute function public.set_updated_at();
create trigger static_pages_set_updated_at before update on public.static_pages
for each row execute function public.set_updated_at();
create trigger faq_items_set_updated_at before update on public.faq_items
for each row execute function public.set_updated_at();
create trigger site_settings_set_updated_at before update on public.site_settings
for each row execute function public.set_updated_at();

-- =========================================================
-- 4) سجل الدفع
-- =========================================================

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete restrict,
  provider_code text,
  external_payment_id text,
  status text not null default 'pending'
    check (status in ('pending', 'requires_action', 'succeeded', 'failed', 'refunded', 'cancelled')),
  amount numeric(12,2) not null check (amount >= 0),
  currency_code char(3) not null,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.payments is 'سجل وصفي لعمليات الدفع عند اعتماد مزود؛ لا تخزن أرقام البطاقات أو رمز CVV أو بيانات اعتماد الدفع.';
create index if not exists payments_booking_idx on public.payments (booking_id, created_at desc);

-- =========================================================
-- 5) المحتوى الذي تديره لوحة الإدارة
-- =========================================================

create table if not exists public.destinations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_ar text not null,
  name_en text not null,
  description_ar text,
  description_en text,
  image_path text,
  image_alt_ar text,
  image_alt_en text,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.destinations is 'وجهات السفر المعروضة للزوار مع محتوى عربي وإنجليزي وصورة بديلة مناسبة لإمكانية الوصول.';
create index if not exists destinations_published_order_idx on public.destinations (is_published, sort_order);

create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  title_ar text,
  title_en text,
  description_ar text,
  description_en text,
  button_label_ar text,
  button_label_en text,
  button_url text,
  image_path text not null,
  image_alt_ar text,
  image_alt_en text,
  is_enabled boolean not null default false,
  sort_order integer not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint banners_valid_window check (ends_at is null or starts_at is null or ends_at > starts_at)
);
comment on table public.banners is 'إدارة صور البنرات ونصوصها وترتيبها ومدة عرضها؛ يجب التحقق من روابط الأزرار عند الحفظ.';
create index if not exists banners_enabled_order_idx on public.banners (is_enabled, sort_order);

create table if not exists public.homepage_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique,
  section_type text not null,
  title_ar text,
  title_en text,
  content_ar jsonb not null default '{}'::jsonb,
  content_en jsonb not null default '{}'::jsonb,
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);
comment on table public.homepage_sections is 'إعدادات أقسام الصفحة الرئيسية ضمن أنواع ومكونات مسموحة؛ لا تسمح بمحتوى HTML غير موثوق.';
create index if not exists homepage_sections_visible_order_idx on public.homepage_sections (is_visible, sort_order);

create table if not exists public.static_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_ar text not null,
  title_en text not null,
  body_ar text not null default '',
  body_en text not null default '',
  is_published boolean not null default false,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.static_pages is 'محتوى الصفحات الثابتة باللغتين؛ النصوص القانونية تحتاج مراجعة قبل نشرها.';
create index if not exists static_pages_published_idx on public.static_pages (is_published, slug);

create table if not exists public.faq_items (
  id uuid primary key default gen_random_uuid(),
  question_ar text not null,
  question_en text not null,
  answer_ar text not null,
  answer_en text not null,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.faq_items is 'الأسئلة الشائعة المنشورة بعد مراجعتها من الإدارة.';
create index if not exists faq_published_order_idx on public.faq_items (is_published, sort_order);

create table if not exists public.site_settings (
  setting_key text primary key,
  setting_value jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);
comment on table public.site_settings is 'إعدادات الموقع العامة غير السرية فقط؛ لا تحفظ مفاتيح API أو كلمات المرور في هذا الجدول.';

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'in_progress', 'resolved', 'spam')),
  internal_note text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
comment on table public.contact_messages is 'رسائل التواصل؛ لا تعرض الرسائل أو الملاحظات الداخلية للزوار أو لمستخدمين غير مخولين.';
create index if not exists contact_messages_status_created_idx on public.contact_messages (status, created_at desc);

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  action_code text not null,
  target_table text,
  target_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
comment on table public.audit_logs is 'سجل العمليات الإدارية المهمة؛ يجب ألا يحتوي على كلمات مرور أو رموز جلسات أو بيانات بطاقات.';
create index if not exists audit_logs_actor_time_idx on public.audit_logs (actor_user_id, created_at desc);
create index if not exists audit_logs_target_idx on public.audit_logs (target_table, target_id);

-- =========================================================
-- 6) تفعيل RLS وتحديد السياسات الأساسية
-- =========================================================

alter table public.roles enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_roles enable row level security;
alter table public.profiles enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_travelers enable row level security;
alter table public.booking_flights enable row level security;
alter table public.booking_status_history enable row level security;
alter table public.payments enable row level security;
alter table public.destinations enable row level security;
alter table public.banners enable row level security;
alter table public.homepage_sections enable row level security;
alter table public.static_pages enable row level security;
alter table public.faq_items enable row level security;
alter table public.site_settings enable row level security;
alter table public.contact_messages enable row level security;
alter table public.audit_logs enable row level security;

-- بيانات الأدوار والصلاحيات للقراءة من قبل المستخدمين المصادق عليهم فقط؛ التعديل إداري.
create policy "roles_read_authenticated" on public.roles
for select to authenticated using (true);
create policy "roles_admin_manage" on public.roles
for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));

create policy "role_permissions_read_authenticated" on public.role_permissions
for select to authenticated using (true);
create policy "role_permissions_admin_manage" on public.role_permissions
for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));

create policy "user_roles_read_self_or_admin" on public.user_roles
for select to authenticated using (user_id = (select auth.uid()) or public.has_role('admin'));
create policy "user_roles_admin_manage" on public.user_roles
for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));

-- المستخدم يقرأ ملفه ويعدّل حقول الملف الشخصي فقط؛ لا توجد أعمدة أدوار في هذا الجدول.
create policy "profiles_read_self_or_admin" on public.profiles
for select to authenticated using (user_id = (select auth.uid()) or public.has_role('admin'));
create policy "profiles_update_self_or_admin" on public.profiles
for update to authenticated using (user_id = (select auth.uid()) or public.has_role('admin'))
with check (user_id = (select auth.uid()) or public.has_role('admin'));
create policy "profiles_admin_insert" on public.profiles
for insert to authenticated with check (public.has_role('admin'));

-- مالك الطلب يقرأ بيانات طلبه فقط. إنشاء الطلب متاح للمستخدم المصادق عليه بملكيته هو.
-- تغيير الحالة أو الملاحظات الداخلية من الواجهة غير مسموح؛ تُنفّذ لاحقاً عبر وظيفة خادمية موثوقة.
create policy "bookings_read_owner_or_admin" on public.bookings
for select to authenticated using (user_id = (select auth.uid()) or public.has_role('admin'));
create policy "bookings_create_owner" on public.bookings
for insert to authenticated with check (user_id = (select auth.uid()) and status = 'new' and admin_notes is null);
create policy "bookings_admin_update" on public.bookings
for update to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));

-- بيانات المسافر والرحلات وسجل الحالة لا يمكن قراءتها إلا من مالك الطلب أو المسؤول.
create policy "travelers_read_owner_or_admin" on public.booking_travelers
for select to authenticated using (
  exists (select 1 from public.bookings b where b.id = booking_id and (b.user_id = (select auth.uid()) or public.has_role('admin')))
);
create policy "travelers_create_owner" on public.booking_travelers
for insert to authenticated with check (
  exists (select 1 from public.bookings b where b.id = booking_id and b.user_id = (select auth.uid()) and b.status = 'new')
);
create policy "travelers_admin_manage" on public.booking_travelers
for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));

create policy "flights_read_owner_or_admin" on public.booking_flights
for select to authenticated using (
  exists (select 1 from public.bookings b where b.id = booking_id and (b.user_id = (select auth.uid()) or public.has_role('admin')))
);
create policy "flights_create_owner" on public.booking_flights
for insert to authenticated with check (
  exists (select 1 from public.bookings b where b.id = booking_id and b.user_id = (select auth.uid()) and b.status = 'new')
);
create policy "flights_admin_manage" on public.booking_flights
for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));

create policy "status_history_read_owner_or_admin" on public.booking_status_history
for select to authenticated using (
  exists (select 1 from public.bookings b where b.id = booking_id and (b.user_id = (select auth.uid()) or public.has_role('admin')))
);
create policy "status_history_admin_insert" on public.booking_status_history
for insert to authenticated with check (public.has_role('admin'));

create policy "payments_read_owner_or_admin" on public.payments
for select to authenticated using (
  exists (select 1 from public.bookings b where b.id = booking_id and (b.user_id = (select auth.uid()) or public.has_role('admin')))
);
create policy "payments_admin_manage" on public.payments
for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));

-- المحتوى المنشور متاح للزوار، بينما التعديل والحذف مقتصران على المسؤول.
create policy "destinations_read_published" on public.destinations
for select to anon, authenticated using (is_published or public.has_role('admin'));
create policy "destinations_admin_manage" on public.destinations
for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));

create policy "banners_read_enabled" on public.banners
for select to anon, authenticated using (is_enabled or public.has_role('admin'));
create policy "banners_admin_manage" on public.banners
for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));

create policy "homepage_sections_read_visible" on public.homepage_sections
for select to anon, authenticated using (is_visible or public.has_role('admin'));
create policy "homepage_sections_admin_manage" on public.homepage_sections
for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));

create policy "static_pages_read_published" on public.static_pages
for select to anon, authenticated using (is_published or public.has_role('admin'));
create policy "static_pages_admin_manage" on public.static_pages
for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));

create policy "faq_read_published" on public.faq_items
for select to anon, authenticated using (is_published or public.has_role('admin'));
create policy "faq_admin_manage" on public.faq_items
for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));

create policy "site_settings_read_authenticated" on public.site_settings
for select to authenticated using (public.has_role('admin'));
create policy "site_settings_admin_manage" on public.site_settings
for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));

-- يسمح للزائر بإرسال رسالة دون حساب، وللمستخدم المسجل بإرسال رسالة باسمه فقط.
-- يمنع هذا الشرط انتحال معرّف مستخدم آخر عبر نموذج التواصل.
create policy "contact_messages_create_public" on public.contact_messages
for insert to anon, authenticated with check (
  status = 'new'
  and internal_note is null
  and (user_id is null or user_id = (select auth.uid()))
);
create policy "contact_messages_admin_read" on public.contact_messages
for select to authenticated using (public.has_role('admin'));
create policy "contact_messages_admin_update" on public.contact_messages
for update to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));

create policy "audit_logs_admin_read" on public.audit_logs
for select to authenticated using (public.has_role('admin'));
create policy "audit_logs_admin_insert" on public.audit_logs
for insert to authenticated with check (public.has_role('admin'));

-- أدوار ابتدائية فقط. لا يتم إسناد دور admin لأي حساب تلقائياً.
insert into public.roles (code, display_name_ar, description_ar)
values
  ('customer', 'عميل', 'يمكنه إدارة ملفه وطلبات الحجز الخاصة به'),
  ('admin', 'مسؤول', 'يدير محتوى الموقع والطلبات والإعدادات')
on conflict (code) do nothing;

commit;
