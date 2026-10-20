/*
 * منطق الواجهة الأولية لمنصة AL Reem.
 * يتولى هذا الملف تبديل اللغة والتحقق الأساسي من نموذج الرحلة وعرض معاينة محلية.
 * لا يتصل هذا الإصدار بقاعدة بيانات أو API خارجي، ولا يرسل طلبات حجز فعلية.
 */
const translations = {
  ar: {
    skip:"تجاوز إلى المحتوى",brandTag:"رحلتك تبدأ هنا",navHome:"الرئيسية",navAccount:"حسابي",navFlights:"الرحلات",navDestinations:"الوجهات",navAbout:"لماذا AL Reem؟",navContact:"تواصل معنا",
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
    skip:"Skip to content",brandTag:"Your journey starts here",navHome:"Home",navAccount:"My account",navFlights:"Flights",navDestinations:"Destinations",navAbout:"Why AL Reem?",navContact:"Contact",
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
  const originText = String(data.get("origin") || "").trim();
  const destinationText = String(data.get("destination") || "").trim();
  const originMatch = originText.match(/\(([A-Z]{3})\)\s*$/);
  const destinationMatch = destinationText.match(/\(([A-Z]{3})\)\s*$/);
  const origin = originMatch ? originMatch[1] : "";
  const destination = destinationMatch ? destinationMatch[1] : "";
  const departDate = String(data.get("departDate") || "");
  const returnDate = String(data.get("returnDate") || "");
  const tripType = String(data.get("tripType") || "round");
  const message = document.getElementById("formMessage");
  const originInput = document.getElementById("origin");
  const destinationInput = document.getElementById("destination");
  const departInput = document.getElementById("departDate");
  [originInput, destinationInput, departInput, document.getElementById("returnDate")].forEach((field) => field.setAttribute("aria-invalid", "false"));
  message.textContent = "";

  if (!origin || !destination || !departDate) {
    message.textContent = (!origin || !destination) ? (currentLanguage === "ar" ? "اختر مطارًا من القائمة المقترحة لكل حقل." : "Select an airport from the suggestions for each field.") : dictionary.missingFields;
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
  if (origin === destination) {
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
    originLabel: originText,
    destinationLabel: destinationText,
    departDate,
    tripType,
    passengers: String(data.get("passengers") || "1"),
    cabin: cabinValue,
    lang: currentLanguage
  });
  if (tripType === "round") params.set("returnDate", returnDate);
  window.location.href = "results.html?" + params.toString();
}


/** Airport autocomplete uses live provider results when available, then a local fallback. */
const LOCAL_AIRPORTS = [
  {code:"BGW",city:"Baghdad",name:"Baghdad International Airport",country:"Iraq",aliases:["بغداد","مطار بغداد","مطار بغداد الدولي"]},
  {code:"EBL",city:"Erbil",name:"Erbil International Airport",country:"Iraq",aliases:["أربيل","اربيل","مطار أربيل"]},
  {code:"BSR",city:"Basra",name:"Basra International Airport",country:"Iraq",aliases:["البصرة","مطار البصرة"]},
  {code:"NJF",city:"Najaf",name:"Al Najaf International Airport",country:"Iraq",aliases:["النجف","مطار النجف"]},
  {code:"ISU",city:"Sulaymaniyah",name:"Sulaimaniyah International Airport",country:"Iraq",aliases:["السليمانية","السليمانيه"]},
  {code:"KIK",city:"Kirkuk",name:"Kirkuk International Airport",country:"Iraq",aliases:["كركوك"]},
  {code:"DXB",city:"Dubai",name:"Dubai International Airport",country:"United Arab Emirates",aliases:["دبي","مطار دبي"]},
  {code:"AUH",city:"Abu Dhabi",name:"Zayed International Airport",country:"United Arab Emirates",aliases:["أبوظبي","ابوظبي","أبو ظبي"]},
  {code:"DOH",city:"Doha",name:"Hamad International Airport",country:"Qatar",aliases:["الدوحة","مطار حمد"]},
  {code:"IST",city:"Istanbul",name:"Istanbul Airport",country:"Türkiye",aliases:["إسطنبول","اسطنبول","مطار إسطنبول"]},
  {code:"SAW",city:"Istanbul",name:"Istanbul Sabiha Gökçen Airport",country:"Türkiye",aliases:["صبيحة","صبيحة كوكجن"]},
  {code:"AMM",city:"Amman",name:"Queen Alia International Airport",country:"Jordan",aliases:["عمان","عمّان","مطار الملكة علياء"]},
  {code:"CAI",city:"Cairo",name:"Cairo International Airport",country:"Egypt",aliases:["القاهرة","مطار القاهرة"]},
  {code:"KWI",city:"Kuwait City",name:"Kuwait International Airport",country:"Kuwait",aliases:["الكويت","مدينة الكويت"]},
  {code:"RUH",city:"Riyadh",name:"King Khalid International Airport",country:"Saudi Arabia",aliases:["الرياض","مطار الملك خالد"]},
  {code:"JED",city:"Jeddah",name:"King Abdulaziz International Airport",country:"Saudi Arabia",aliases:["جدة","جده","مطار الملك عبدالعزيز"]},
  {code:"LHR",city:"London",name:"Heathrow Airport",country:"United Kingdom",aliases:["لندن","هيثرو"]},
  {code:"CDG",city:"Paris",name:"Charles de Gaulle Airport",country:"France",aliases:["باريس"]},
  {code:"FRA",city:"Frankfurt",name:"Frankfurt Airport",country:"Germany",aliases:["فرانكفورت"]},
  {code:"JFK",city:"New York",name:"John F. Kennedy International Airport",country:"United States",aliases:["نيويورك"]}
];


const AIRPORT_LABELS = {
  BGW:{ar:["بغداد","مطار بغداد الدولي","العراق"],en:["Baghdad","Baghdad International Airport","Iraq"]},
  EBL:{ar:["أربيل","مطار أربيل الدولي","العراق"],en:["Erbil","Erbil International Airport","Iraq"]},
  BSR:{ar:["البصرة","مطار البصرة الدولي","العراق"],en:["Basra","Basra International Airport","Iraq"]},
  NJF:{ar:["النجف","مطار النجف الدولي","العراق"],en:["Najaf","Al Najaf International Airport","Iraq"]},
  ISU:{ar:["السليمانية","مطار السليمانية الدولي","العراق"],en:["Sulaymaniyah","Sulaimaniyah International Airport","Iraq"]},
  KIK:{ar:["كركوك","مطار كركوك","العراق"],en:["Kirkuk","Kirkuk International Airport","Iraq"]},
  DXB:{ar:["دبي","مطار دبي الدولي","الإمارات العربية المتحدة"],en:["Dubai","Dubai International Airport","United Arab Emirates"]},
  AUH:{ar:["أبوظبي","مطار زايد الدولي","الإمارات العربية المتحدة"],en:["Abu Dhabi","Zayed International Airport","United Arab Emirates"]},
  DOH:{ar:["الدوحة","مطار حمد الدولي","قطر"],en:["Doha","Hamad International Airport","Qatar"]},
  IST:{ar:["إسطنبول","مطار إسطنبول","تركيا"],en:["Istanbul","Istanbul Airport","Türkiye"]},
  SAW:{ar:["إسطنبول","مطار صبيحة كوكجن","تركيا"],en:["Istanbul","Istanbul Sabiha Gökçen Airport","Türkiye"]},
  AMM:{ar:["عمّان","مطار الملكة علياء الدولي","الأردن"],en:["Amman","Queen Alia International Airport","Jordan"]},
  CAI:{ar:["القاهرة","مطار القاهرة الدولي","مصر"],en:["Cairo","Cairo International Airport","Egypt"]},
  KWI:{ar:["الكويت","مطار الكويت الدولي","الكويت"],en:["Kuwait City","Kuwait International Airport","Kuwait"]},
  RUH:{ar:["الرياض","مطار الملك خالد الدولي","السعودية"],en:["Riyadh","King Khalid International Airport","Saudi Arabia"]},
  JED:{ar:["جدة","مطار الملك عبدالعزيز الدولي","السعودية"],en:["Jeddah","King Abdulaziz International Airport","Saudi Arabia"]},
  LHR:{ar:["لندن","مطار هيثرو","المملكة المتحدة"],en:["London","Heathrow Airport","United Kingdom"]},
  CDG:{ar:["باريس","مطار شارل ديغول","فرنسا"],en:["Paris","Charles de Gaulle Airport","France"]},
  FRA:{ar:["فرانكفورت","مطار فرانكفورت","ألمانيا"],en:["Frankfurt","Frankfurt Airport","Germany"]},
  JFK:{ar:["نيويورك","مطار جون إف كينيدي الدولي","الولايات المتحدة"],en:["New York","John F. Kennedy International Airport","United States"]}
};
function localizedAirport(airport) {
  const labels = AIRPORT_LABELS[airport.code] && AIRPORT_LABELS[airport.code][currentLanguage];
  return labels ? { city: labels[0], name: labels[1], country: labels[2], code: airport.code } : airport;
}

function normalizeAirportSearch(value) {
  return String(value || "").toLocaleLowerCase("ar").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").trim();
}

function setupAirportAutocomplete(inputId, listId) {
  const input = document.getElementById(inputId);
  const list = document.getElementById(listId);
  if (!input || !list) return;
  let timer = null, activeIndex = -1, shownAirports = [];
  function closeList() { list.hidden = true; list.replaceChildren(); activeIndex = -1; shownAirports = []; }
  function choose(airport) {
    const display = localizedAirport(airport);
    input.value = (display.city || display.name) + " — " + display.name + " (" + display.code + ")";
    closeList();
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }
  function render(airports) {
    shownAirports = airports.slice(0, 8);
    list.replaceChildren();
    if (!shownAirports.length) { closeList(); return; }
    shownAirports.forEach((airport) => {
      const option = document.createElement("button");
      option.type = "button"; option.className = "airport-suggestion";
      option.setAttribute("role", "option"); option.setAttribute("aria-selected", "false");
      const main = document.createElement("span");
      main.className = "airport-suggestion-main";
      const display = localizedAirport(airport);
      main.textContent = (display.city || display.name) + " — " + display.name;
      const meta = document.createElement("span");
      meta.className = "airport-suggestion-meta";
      meta.textContent = airport.code + (display.country ? " · " + display.country : "");
      option.append(main, meta);
      option.addEventListener("mousedown", event => event.preventDefault());
      option.addEventListener("click", () => choose(airport));
      list.append(option);
    });
    list.hidden = false;
  }
  input.addEventListener("input", () => {
    clearTimeout(timer);
    const query = input.value.trim(), needle = normalizeAirportSearch(query);
    if (needle.length < 2 || /\([A-Z]{3}\)\s*$/.test(query)) { closeList(); return; }
    timer = setTimeout(async () => {
      let remote = [];
      try {
        const response = await fetch("/api/airports?q=" + encodeURIComponent(query), { headers: { "Accept": "application/json" } });
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) remote = data.filter(a => /^[A-Z]{3}$/.test(String(a.code || "")));
        }
      } catch (_) {}
      if (input.value.trim() !== query) return;
      const localMatches = LOCAL_AIRPORTS.filter(a =>
        [a.code, a.city, a.name, a.country, ...(a.aliases || [])]
          .some(value => normalizeAirportSearch(value).includes(needle))
      );
      const seen = new Set();
      const merged = [...remote, ...localMatches].filter(a => {
        if (!a.code || seen.has(a.code)) return false;
        seen.add(a.code); return true;
      }).slice(0, 8);
      render(merged);
    }, 180);
  });
  input.addEventListener("keydown", event => {
    if (list.hidden || !shownAirports.length) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      activeIndex = (activeIndex + (event.key === "ArrowDown" ? 1 : shownAirports.length - 1)) % shownAirports.length;
      [...list.children].forEach((node, index) => {
        node.setAttribute("aria-selected", String(index === activeIndex));
        if (index === activeIndex) node.scrollIntoView({ block: "nearest" });
      });
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault(); choose(shownAirports[activeIndex]);
    } else if (event.key === "Escape") closeList();
  });
  input.addEventListener("blur", () => setTimeout(closeList, 180));
  document.addEventListener("click", event => { if (!event.target.closest("#" + inputId) && !event.target.closest("#" + listId)) closeList(); });
}

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
  setupAirportAutocomplete("origin", "originSuggestions");
  setupAirportAutocomplete("destination", "destinationSuggestions");
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