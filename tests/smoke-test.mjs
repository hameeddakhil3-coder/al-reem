/**
 * اختبارات تحقق ساكنة أولية لمشروع AL Reem.
 *
 * الغرض: اكتشاف بعض الأخطاء الأساسية في ملفات الواجهة دون تثبيت حزم خارجية.
 * هذه الاختبارات لا تشغّل متصفحًا ولا تثبت صحة التصميم المرئي أو سلوك DOM وقت التشغيل.
 *
 * التشغيل من جذر المشروع:
 *   node tests/smoke-test.mjs
 */
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const js = readFileSync(new URL("../app.js", import.meta.url), "utf8");
const migration = readFileSync(
  new URL("../supabase/migrations/202610190001_initial_schema.sql", import.meta.url),
  "utf8"
);
const publicHtml = readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
const publicCss = readFileSync(new URL("../public/styles.css", import.meta.url), "utf8");
const publicJs = readFileSync(new URL("../public/app.js", import.meta.url), "utf8");
const wrangler = readFileSync(new URL("../wrangler.jsonc", import.meta.url), "utf8");

// يتحقق من أن العناصر الرئيسية والملفات المرتبطة بها موجودة في الصفحة.
assert.match(html, /<html lang="ar" dir="rtl">/, "يجب أن تبدأ الصفحة بالعربية وباتجاه RTL");
assert.match(html, /id="flightSearchForm"/, "نموذج البحث عن الرحلات مطلوب");
assert.match(html, /id="languageToggle"/, "زر تبديل اللغة مطلوب");
assert.match(html, /\.\/styles\.css/, "يجب ربط ملف التنسيقات");
assert.match(html, /\.\/app\.js/, "يجب ربط ملف التفاعل");

assert.equal(publicHtml, html, "يجب أن تطابق نسخة public صفحة الجذر");
assert.equal(publicCss, css, "يجب أن تطابق نسخة public ملف التنسيق");
assert.equal(publicJs, js, "يجب أن تطابق نسخة public ملف التفاعل");
assert.ok(wrangler.includes('"directory": "./public"'), "يجب توجيه Wrangler إلى مجلد الأصول العامة");

// يمنع الاختبار اعتبار نموذج البحث اتصالًا فعليًا بمزود طيران في هذه المرحلة.
assert.match(html, /مراجعة يدوية|manualBadge/, "يجب توضيح أن الطلب يخضع لمراجعة يدوية");
assert.match(js, /pastDeparture/, "يجب توفير رسالة تحقق من تاريخ المغادرة السابق");
assert.match(js, /departure date cannot be in the past|لا يمكن اختيار تاريخ مغادرة سابق لليوم/i,
  "يجب توضيح رفض تاريخ المغادرة السابق");

// يتحقق من وجود أساسيات الأمان في مسودة SQL، وليس من صلاحيتها التشغيلية.
assert.match(migration, /enable row level security;/i, "يجب تفعيل RLS على الجداول المناسبة");
const declaredTables = [...migration.matchAll(/create table if not exists public\.([a-z_]+)/gi)].map((match) => match[1]);
const rlsTables = [...migration.matchAll(/alter table public\.([a-z_]+) enable row level security/gi)].map((match) => match[1]);
for (const table of declaredTables) {
  assert.ok(rlsTables.includes(table), `يجب تفعيل RLS على جدول ${table}`);
}
assert.match(migration, /function public\.has_role\(required_role text\)[\s\S]*?security definer[\s\S]*?set search_path = ''/i,
  "يجب أن تكون دالة فحص الدور محمية وتستخدم search_path فارغًا");
assert.match(migration, /create trigger bookings_guard_status_change[\s\S]*?execute function public\.guard_booking_status_change\(\)/i,
  "يجب ربط التحقق من انتقالات حالة الحجز بمشغّل قاعدة البيانات");
assert.match(migration, /insert into public\.booking_status_history/i,
  "يجب تسجيل انتقالات حالة الحجز في سجل التاريخ");

assert.match(migration, /grant execute on function public\.has_role\(text\) to anon, authenticated;/i,
  "يجب السماح للزائر بتقييم سياسات المحتوى العام دون خطأ صلاحيات");
assert.match(migration, /bookings_guard_status_change|guard_booking_status_change/i,
  "يجب وجود تحقق من انتقالات حالة الحجز");
assert.match(migration, /booking_status_history/i, "يجب وجود سجل تاريخ حالات الحجز");
assert.match(migration, /reference_code text not null unique/i,
  "يجب أن يكون الرقم المرجعي فريدًا");
assert.match(migration, /bookings_generate_reference_code|generate_booking_reference_code/i,
  "يجب توليد الرقم المرجعي داخل قاعدة البيانات لا من المتصفح");
assert.doesNotMatch(migration, /\bas \$(?!\$)/i,
  "يجب استخدام محددات صحيحة لنصوص الدوال في SQL");
assert.doesNotMatch(migration, /^\$;$/m,
  "يجب إغلاق نصوص الدوال باستخدام محددات الدولار المزدوجة");
const paymentsTablePosition = migration.indexOf("create table if not exists public.payments");
const updatedAtTriggerPosition = migration.indexOf("create trigger profiles_set_updated_at");
assert.ok(paymentsTablePosition >= 0 && updatedAtTriggerPosition > paymentsTablePosition,
  "يجب إنشاء جدول payments قبل مشغلات updated_at التي تشير إليه");

// تحقق ساكن محدود من وجود قواعد ألوان مركزية وحالة إخفاء عناصر HTML.
assert.match(css, /--red:#850d24/i, "يجب تعريف لون العلامة المركزي");
assert.match(css, /\[hidden\]\{display:none!important\}/i, "يجب احترام خاصية hidden");

console.log("نجحت جميع اختبارات التحقق الساكنة الأولية.");
console.log("تنبيه: هذه الاختبارات لا تغني عن تشغيل الموقع في متصفح أو اختبار SQL على قاعدة منفصلة.");
