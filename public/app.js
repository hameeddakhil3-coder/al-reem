/*
 * منطق الواجهة الأولية لمنصة AL Reem.
 * يتولى هذا الملف تبديل اللغة والتحقق الأساسي من نموذج الرحلة وعرض معاينة محلية.
 * لا يتصل هذا الإصدار بقاعدة بيانات أو API خارجي، ولا يرسل طلبات حجز فعلية.
 */
const translations = {
  ar: {
    skip:"تجاوز إلى المحتوى",brandTag:"رحلتك تبدأ هنا",navHome:"الرئيسية",navFlights:"الرحلات",navDestinations:"الوجهات",navAbout:"لماذا AL Reem؟",navContact:"تواصل معنا",
    eyebrow:"خطّط لرحلتك بثقة",heroTitle:"العالم أقرب<br><em>مما تتخيّل.</em>",heroDescription:"ابدأ رحلتك القادمة بتجربة بحث بسيطة وواضحة، ودع فريق AL Reem يساعدك في متابعة طلب الحجز.",
    pointOne:"خطوات واضحة",pointTwo:"متابعة بشرية للطلبات",noteKicker:"مساحة جديدة لاكتشاف العالم",noteText:"رحلتك مهمة. نعمل على جعل التخطيط لها أكثر سهولة ووضوحًا.",
    searchKicker:"ابدأ من هنا",searchTitle:"إلى أين تأخذك رحلتك؟",manualBadge:"طلب حجز بمراجعة يدوية",tripType:"نوع الرحلة",roundTrip:"ذهاب وعودة",oneWay:"ذهاب فقط",
    fromLabel:"من",toLabel:"إلى",departLabel:"تاريخ المغادرة",returnLabel:"تاريخ العودة",passengersLabel:"المسافرون",cabinLabel:"درجة السفر",
    fromPlaceholder:"مدينة أو مطار المغادرة",toPlaceholder:"مدينة أو مطار الوصول",economy:"اقتصادية",business:"رجال الأعمال",first:"الأولى",
    formHint:"هذا النموذج يجهّز طلب بحث فقط؛ لم يتم ربط مزود رحلات حتى الآن.",searchButton:"متابعة طلب الرحلة",
    destKicker:"وجهات سياحية شهيرة",destTitle:"وجهات تستحق الاكتشاف",destDescription:"اكتشف وجهات يحب المسافرون زيارتها. هذه بطاقات إلهامية وليست عروضًا أو أسعارًا متاحة للحجز.",
    destLabel:"وجهة للإلهام",istanbul:"إسطنبول",istanbulDesc:"بين التاريخ والحياة الحديثة",dubai:"دبي",dubaiDesc:"تجارب مدينة لا تتوقف",paris:"باريس",parisDesc:"فنّ وثقافة وأجواء مميزة",
    destDisclaimer:"الوجهات مقترحة للإلهام؛ لا تمثل بيانات حجوزات فعلية أو توافر رحلات.",whyKicker:"تجربة أوضح من البداية",whyTitle:"كل خطوة<br><em>لها معنى.</em>",
    benefitOneTitle:"بحث بسيط ومنظم",benefitOneText:"أدخل تفاصيل رحلتك في نموذج واضح، دون خطوات غير ضرورية.",benefitTwoTitle:"مراجعة بشرية للطلب",benefitTwoText:"في المرحلة الأولى، تتم مراجعة الطلبات يدويًا ولا يُعد إرسال الطلب تذكرة مؤكدة.",benefitThreeTitle:"معلومات واضحة",benefitThreeText:"نوضح ما هو متاح فعليًا وما يحتاج إلى تأكيد قبل اتخاذ القرار.",
    contactKicker:"نحن هنا للمساعدة",contactTitle:"لديك سؤال عن رحلتك؟",contactText:"سيتم تفعيل قنوات التواصل الفعلية عند إعداد بيانات الاتصال الرسمية.",contactButton:"قريبًا — قنوات التواصل",
    footerText:"نخطط لتجربة سفر أكثر وضوحًا، خطوة بخطوة.",footerDisclaimer:"نسخة تأسيسية قيد التطوير — لا توجد حجوزات فعلية بعد.",
    requestKicker:"ملخص طلبك",dialogTitle:"تفاصيل الرحلة",dialogNotice:"هذه معاينة محلية فقط. لم يُرسل طلب ولم يتم الاتصال بمزود طيران.",dialogDone:"حسنًا",
    missingFields:"يرجى إدخال مدينة المغادرة والوصول وتاريخ المغادرة.",pastDeparture:"لا يمكن اختيار تاريخ مغادرة سابق لليوم.",sameCity:"يرجى اختيار مدينتين مختلفتين.",badReturn:"يجب أن يكون تاريخ العودة في يوم المغادرة أو بعده.",round:"ذهاب وعودة",oneway:"ذهاب فقط",
    summaryFrom:"المغادرة من",summaryTo:"الوصول إلى",summaryDepart:"تاريخ المغادرة",summaryReturn:"تاريخ العودة",summaryPassengers:"عدد المسافرين",summaryCabin:"درجة السفر"
  },
  en: {
    skip:"Skip to content",brandTag:"Your journey starts here",navHome:"Home",navFlights:"Flights",navDestinations:"Destinations",navAbout:"Why AL Reem?",navContact:"Contact",
    eyebrow:"Plan your journey with confidence",heroTitle:"The world is closer<br><em>than you think.</em>",heroDescription:"Start your next journey with a clear, simple search experience. AL Reem is being built to help you follow your booking request.",
    pointOne:"Clear steps",pointTwo:"Human-reviewed requests",noteKicker:"A new way to discover the world",noteText:"Your journey matters. We're working to make planning it clearer and easier.",
    searchKicker:"Start here",searchTitle:"Where will your journey take you?",manualBadge:"Booking requests reviewed manually",tripType:"Trip type",roundTrip:"Round trip",oneWay:"One way",
    fromLabel:"From",toLabel:"To",departLabel:"Departure date",returnLabel:"Return date",passengersLabel:"Travelers",cabinLabel:"Cabin class",
    fromPlaceholder:"Departure city or airport",toPlaceholder:"Arrival city or airport",economy:"Economy",business:"Business",first:"First",
    formHint:"This form only prepares a search request. No flight provider is connected yet.",searchButton:"Continue trip request",
    destKicker:"Popular destinations",destTitle:"Places worth discovering",destDescription:"Explore destinations travelers love to visit. These cards are inspiration, not bookable offers or live prices.",
    destLabel:"Destination inspiration",istanbul:"Istanbul",istanbulDesc:"Where history meets modern life",dubai:"Dubai",dubaiDesc:"A city of endless experiences",paris:"Paris",parisDesc:"Art, culture and distinctive charm",
    destDisclaimer:"Destinations are suggestions for inspiration; they do not represent actual booking data or flight availability.",whyKicker:"A clearer experience from day one",whyTitle:"Every step<br><em>has a purpose.</em>",
    benefitOneTitle:"Simple, organized search",benefitOneText:"Enter your trip details in a clear form, without unnecessary steps.",benefitTwoTitle:"Human review",benefitTwoText:"During the first phase, requests are reviewed manually. Submitting a request does not mean a ticket is confirmed.",benefitThreeTitle:"Clear information",benefitThreeText:"We distinguish what is actually available from what still needs confirmation.",
    contactKicker:"We're here to help",contactTitle:"Have a question about your trip?",contactText:"Live contact channels will be enabled once official contact details are configured.",contactButton:"Coming soon — contact channels",
    footerText:"A clearer travel experience, one step at a time.",footerDisclaimer:"Foundational preview under development — no live bookings yet.",
    requestKicker:"Your request summary",dialogTitle:"Trip details",dialogNotice:"This is a local preview only. Nothing was submitted and no flight provider was contacted.",dialogDone:"Got it",
    missingFields:"Please enter departure city, arrival city and departure date.",pastDeparture:"Departure date cannot be in the past.",sameCity:"Please choose two different cities.",badReturn:"The return date must be on or after the departure date.",round:"Round trip",oneway:"One way",
    summaryFrom:"From",summaryTo:"To",summaryDepart:"Departure",summaryReturn:"Return",summaryPassengers:"Travelers",summaryCabin:"Cabin"
  }
};
let currentLanguage = "ar";

/** يحدّث نصوص الواجهة واتجاه الصفحة بحسب اللغة المختارة، مع إبقاء النصوص الديناميكية آمنة. */
function setLanguage(language) {
  currentLanguage = language === "en" ? "en" : "ar";
  const dictionary = translations[currentLanguage];
  document.documentElement.lang = currentLanguage;
  document.documentElement.dir = currentLanguage === "ar" ? "rtl" : "ltr";
  document.body.lang = currentLanguage;
  document.getElementById("languageToggle").textContent = currentLanguage === "ar" ? "EN" : "ع";
  document.getElementById("menuToggle").setAttribute("aria-label", currentLanguage === "ar" ? "فتح القائمة" : "Open menu");
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    if (dictionary[key] !== undefined) element.innerHTML = dictionary[key];
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    const key = element.dataset.i18nPlaceholder;
    if (dictionary[key] !== undefined) element.placeholder = dictionary[key];
  });
  document.title = currentLanguage === "ar" ? "AL Reem | رحلتك تبدأ هنا" : "AL Reem | Your journey starts here";
}

/** يخفي حقل العودة ويعطل التحقق منه عندما يختار المستخدم رحلة باتجاه واحد. */
function updateTripType() {
  const isRoundTrip = document.querySelector('input[name="tripType"]:checked').value === "round";
  const returnField = document.getElementById("returnField");
  const returnInput = document.getElementById("returnDate");
  returnField.hidden = !isRoundTrip;
  returnInput.required = isRoundTrip;
  returnInput.disabled = !isRoundTrip;
}

/** يعرض معاينة محلية لملخص البحث بعد التحقق من الحقول، ولا يرسل أي بيانات للخادم. */
function handleFlightSearch(event) {
  event.preventDefault();
  const dictionary = translations[currentLanguage];
  const form = event.currentTarget;
  const data = new FormData(form);
  const origin = String(data.get("origin") || "").trim();
  const destination = String(data.get("destination") || "").trim();
  const departDate = String(data.get("departDate") || "");
  const returnDate = String(data.get("returnDate") || "");
  const tripType = String(data.get("tripType") || "round");
  const message = document.getElementById("formMessage");
  const originInput = document.getElementById("origin");
  const destinationInput = document.getElementById("destination");
  const departInput = document.getElementById("departDate");
  [originInput, destinationInput, departInput].forEach((field) => field.setAttribute("aria-invalid", "false"));

  if (!origin || !destination || !departDate) {
    message.textContent = dictionary.missingFields;
    if (!origin) originInput.setAttribute("aria-invalid", "true");
    if (!destination) destinationInput.setAttribute("aria-invalid", "true");
    if (!departDate) departInput.setAttribute("aria-invalid", "true");
    return;
  }
  // لا نعتمد على خاصية min في المتصفح وحدها؛ لأن النموذج يستخدم تحققًا مخصصًا.
  // نعيد التحقق هنا حتى لا تمر تواريخ ماضية عند تجاوز تحقق HTML الافتراضي.
  const now = new Date();
  const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  if (departDate < today) {
    message.textContent = dictionary.pastDeparture;
    departInput.setAttribute("aria-invalid", "true");
    return;
  }
  if (origin.toLocaleLowerCase() === destination.toLocaleLowerCase()) {
    message.textContent = dictionary.sameCity;
    originInput.setAttribute("aria-invalid", "true");
    destinationInput.setAttribute("aria-invalid", "true");
    return;
  }
  if (tripType === "round" && (!returnDate || returnDate < departDate)) {
    message.textContent = dictionary.badReturn;
    document.getElementById("returnDate").setAttribute("aria-invalid", "true");
    return;
  }

  const cabinValue = String(data.get("cabin") || "economy");
  const params = new URLSearchParams({
    origin,
    destination,
    departDate,
    tripType,
    passengers: String(data.get("passengers") || "1"),
    cabin: cabinValue,
    lang: currentLanguage
  });
  if (tripType === "round") params.set("returnDate", returnDate);
  window.location.href = "results.html?" + params.toString();
}

/** يربط عناصر الواجهة بالأحداث بعد تحميل الصفحة ويضع الحد الأدنى لتاريخ المغادرة. */
function initializeApp() {
  document.getElementById("year").textContent = String(new Date().getFullYear());
  const today = new Date();
  const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const departDate = document.getElementById("departDate");
  const returnDate = document.getElementById("returnDate");
  departDate.min = localToday;
  returnDate.min = localToday;
  departDate.addEventListener("change", () => {
    returnDate.min = departDate.value || localToday;
    if (returnDate.value && returnDate.value < returnDate.min) returnDate.value = returnDate.min;
  });
  document.querySelectorAll('input[name="tripType"]').forEach((input) => input.addEventListener("change", updateTripType));
  document.getElementById("flightSearchForm").addEventListener("submit", handleFlightSearch);
  document.getElementById("languageToggle").addEventListener("click", () => setLanguage(currentLanguage === "ar" ? "en" : "ar"));
  document.getElementById("menuToggle").addEventListener("click", () => {
    const nav = document.getElementById("mainNav");
    const isOpen = nav.classList.toggle("is-open");
    document.getElementById("menuToggle").setAttribute("aria-expanded", String(isOpen));
  });
  document.querySelectorAll("#mainNav a").forEach((link) => link.addEventListener("click", () => {
    document.getElementById("mainNav").classList.remove("is-open");
    document.getElementById("menuToggle").setAttribute("aria-expanded", "false");
  }));
  const dialog = document.getElementById("requestDialog");
  document.getElementById("dialogClose").addEventListener("click", () => dialog.close());
  document.getElementById("dialogDone").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  updateTripType();
  setLanguage("ar");
}
document.addEventListener("DOMContentLoaded", initializeApp);