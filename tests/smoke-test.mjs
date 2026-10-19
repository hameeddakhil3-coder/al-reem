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

// يتحقق من أن العناصر الرئيسية والملفات المرتبطة بها موجودة في الصفحة.
assert.match(html, /<html lang="ar" dir="rtl">/, "يجب أن تبدأ الصفحة بالعربية وباتجاه RTL");
assert.match(html, /id="flightSearchForm"/, "نموذج البحث عن الرحلات مطلوب");
assert.match(html, /id="languageToggle"/, "زر تبديل اللغة مطلوب");
assert.match(html, /\.\/styles\.css/, "يجب ربط ملف التنسيقات");
assert.match(html, /\.\/app\.js/, "يجب ربط ملف التفاعل");

// يمنع الاختبار اعتبار نموذج البحث اتصالًا فعليًا بمزود طيران في هذه المرحلة.
assert.match(html, /مراجعة يدوية|manualBadge/, "يجب توضيح أن الطلب يخضع لمراجعة يدوية");
assert.match(js, /pastDeparture/, "يجب توفير رسالة تحقق من تاريخ المغادرة السابق");
assert.match(js, /departure date cannot be in the past|لا يمكن اختيار تاريخ مغادرة سابق لليوم/i,
  "يجب توضيح رفض تاريخ المغادرة السابق");

// يتحقق من وجود أساسيات الأمان في مسودة SQL، وليس من صلاحيتها التشغيلية.
assert.match(migration, /enable row level security;/i, "يجب تفعيل RLS على الجداول المناسبة");
assert.match(migration, /bookings_guard_status_change|guard_booking_status_change/i,
  "يجب وجود تحقق من انتقالات حالة الحجز");
assert.match(migration, /booking_status_history/i, "يجب وجود سجل تاريخ حالات الحجز");
assert.match(migration, /reference_code text not null unique/i,
  "يجب أن يكون الرقم المرجعي فريدًا");

// تحقق ساكن محدود من وجود قواعد ألوان مركزية وحالة إخفاء عناصر HTML.
assert.match(css, /--red:#850d24/i, "يجب تعريف لون العلامة المركزي");
assert.match(css, /\[hidden\]\{display:none!important\}/i, "يجب احترام خاصية hidden");

console.log("نجحت جميع اختبارات التحقق الساكنة الأولية.");
console.log("تنبيه: هذه الاختبارات لا تغني عن تشغيل الموقع في متصفح أو اختبار SQL على قاعدة منفصلة.");
