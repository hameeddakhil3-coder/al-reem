(() => {
  const params = new URLSearchParams(window.location.search);
  const dictionaries = {
    ar: {tag:"رحلتك تبدأ هنا",edit:"تعديل البحث",kicker:"نتائج البحث",title:"تفاصيل رحلتك",subtitle:"راجع تفاصيل البحث أدناه. سنعرض الرحلات الفعلية عند ربط مزود بيانات الرحلات.",manual:"مرحلة المراجعة اليدوية",request:"طلب حجز يدوي",account:"تسجيل الدخول / حسابي",from:"من",to:"إلى",depart:"المغادرة",ret:"العودة",trip:"نوع الرحلة",round:"ذهاب وعودة",oneway:"ذهاب فقط",travelers:"المسافرون",cabin:"درجة السفر",economy:"اقتصادية",business:"رجال الأعمال",first:"الأولى",emptyTitle:"لا توجد نتائج رحلات مباشرة بعد",emptyText:"تم نقل تفاصيل البحث إلى هذه الصفحة، لكن AL REEM لم يُربط بعد بمزود يعرض الأسعار والمقاعد المتاحة. لن نعرض أسعارًا أو رحلات غير مؤكدة.",note:"هذه ليست تذكرة أو حجزًا مؤكدًا. يمكنك إرسال طلب حجز للمراجعة اليدوية بعد تسجيل الدخول. إرسال الطلب لا يعني تأكيد التذكرة أو السعر.",back:"العودة لتعديل البحث",contact:"تواصل معنا",footer:"نسخة قيد التطوير — لا توجد نتائج مباشرة بعد.",missing:"لم يتم العثور على تفاصيل بحث صالحة. ارجع إلى نموذج البحث وأدخل بيانات الرحلة."},
    en: {tag:"Your journey starts here",edit:"Edit search",kicker:"Search results",title:"Your trip details",subtitle:"Review your search below. Live flights will appear once a flight-data provider is connected.",manual:"Manual review phase",request:"Request manual booking",account:"Sign in / My account",from:"From",to:"To",depart:"Departure",ret:"Return",trip:"Trip type",round:"Round trip",oneway:"One way",travelers:"Travelers",cabin:"Cabin class",economy:"Economy",business:"Business",first:"First",emptyTitle:"No live flight results yet",emptyText:"Your search details have been carried to this page, but AL REEM is not yet connected to a provider for live fares and seat availability. We will not show unverified flights or prices.",note:"This is not a ticket or confirmed booking. You can submit a manual booking request after signing in. Submission does not confirm a ticket or fare.",back:"Edit search",contact:"Contact us",footer:"Under development — no live results yet.",missing:"No valid search details were found. Return to the search form and enter your trip details."}
  };
  let lang = params.get("lang") === "en" ? "en" : "ar";
  const cabinLabels = {economy:"economy",business:"business",first:"first"};
  const originValue = (params.get("origin") || "").trim();
  const destinationValue = (params.get("destination") || "").trim();
  const originLabel = params.get("originLabel") || originValue;
  const destinationLabel = params.get("destinationLabel") || destinationValue;
  const departureValue = params.get("departDate") || "";
  const returnValue = params.get("returnDate") || "";
  const tripValue = params.get("tripType") || "oneway";
  const now = new Date();
  const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const valid = originValue.length >= 2 && destinationValue.length >= 2 && originValue.toLocaleLowerCase() !== destinationValue.toLocaleLowerCase() && /^\d{4}-\d{2}-\d{2}$/.test(departureValue) && departureValue >= today && (tripValue !== "round" || (/^\d{4}-\d{2}-\d{2}$/.test(returnValue) && returnValue >= departureValue));
  function applyLanguage() {
    const d = dictionaries[lang];
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.body.lang = lang;
    document.querySelectorAll("[data-t]").forEach(el => { const key = el.dataset.t; if (d[key]) el.textContent = d[key]; });
    document.getElementById("languageToggle").textContent = lang === "ar" ? "EN" : "ع";
    document.title = lang === "ar" ? "AL REEM | نتائج البحث" : "AL REEM | Search results";
    const bookingLink = document.getElementById("bookingLink"); if (bookingLink) bookingLink.href = "./booking.html" + location.search;
    const summary = document.getElementById("tripSummary");
    if (!valid) { summary.innerHTML = '<div><dt></dt><dd></dd></div>'; document.querySelector(".results-empty p").textContent = d.missing; return; }
    const cabinKey = cabinLabels[params.get("cabin")] || "economy";
    const tripKey = params.get("tripType") === "round" ? "round" : "oneway";
    const items = [[d.from,originLabel],[d.to,destinationLabel],[d.depart,departureValue]];
    if (tripKey === "round" && returnValue) items.push([d.ret,returnValue]);
    items.push([d.trip,d[tripKey]],[d.travelers,String(Math.min(6, Math.max(1, Number(params.get("passengers")) || 1)))],[d.cabin,d[cabinKey]]);
    summary.replaceChildren(...items.map(([label,value]) => {
      const wrapper = document.createElement("div"), dt = document.createElement("dt"), dd = document.createElement("dd");
      dt.textContent = label; dd.textContent = value; wrapper.append(dt,dd); return wrapper;
    }));
    document.getElementById("year").textContent = String(new Date().getFullYear());
  }
  document.getElementById("languageToggle").addEventListener("click", () => { lang = lang === "ar" ? "en" : "ar"; applyLanguage(); });

  async function loadLiveFlights() {
    const container = document.getElementById("liveResults");
    if (!valid || !container) return;
    const emptyText = document.querySelector(".results-empty > p");
    if (emptyText) emptyText.textContent = lang === "ar" ? "جارٍ البحث عن الأسعار المتاحة..." : "Searching available fares...";
    try {
      const response = await fetch("/api/flights/search", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          origin: originValue,
          destination: destinationValue,
          departure_date: departureValue,
          return_date: tripValue === "round" ? returnValue : undefined,
          adults: Math.min(9, Math.max(1, Number(params.get("passengers")) || 1)),
          cabin_class: params.get("cabin") || "economy",
          market: "IQ"
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (emptyText) emptyText.textContent = data.message || (lang === "ar" ? "تعذّر إكمال البحث الآن. حاول لاحقًا." : "Search could not be completed. Please try again later.");
        return;
      }
      const itineraries = Array.isArray(data.itineraries) ? data.itineraries : [];
      if (!itineraries.length) {
        if (emptyText) emptyText.textContent = lang === "ar" ? "لم يعثر المزوّد على عروض لهذه التفاصيل. جرّب تاريخًا أو مطارًا آخر." : "The provider returned no offers for these details. Try another date or airport.";
        return;
      }
      if (emptyText) emptyText.textContent = lang === "ar" ? "عروض الأسعار التي أعادها مزوّد الرحلات. السعر والتوافر قد يتغيران قبل الحجز." : "Fares returned by the flight provider. Price and availability may change before booking.";
      const title = document.getElementById("emptyTitle");
      if (title) title.textContent = lang === "ar" ? "عروض الرحلات المتاحة" : "Available flight offers";
      const icon = document.querySelector(".results-empty .empty-icon");
      if (icon) icon.hidden = true;
      container.replaceChildren(...itineraries.map((item) => {
        const card = document.createElement("article");
        card.className = "flight-result-card";
        const heading = document.createElement("h3");
        const outbound = item.outbound || (Array.isArray(item.legs) ? item.legs[0] : {}) || {};
        heading.textContent = outbound.carrier || (lang === "ar" ? "رحلة جوية" : "Flight");
        const details = document.createElement("p");
        const segments = Array.isArray(outbound.segments) ? outbound.segments : [];
        const first = segments[0] || {};
        const last = segments[segments.length - 1] || {};
        const route = (first.departure_airport || originValue) + " → " + (last.arrival_airport || destinationValue);
        const time = first.departure_time_local ? " · " + first.departure_time_local.replace("T", " ") : "";
        const stops = segments.length > 0 ? Math.max(0, segments.length - 1) : null;
        const stopText = stops === null ? "" : (lang === "ar" ? " · " + (stops === 0 ? "مباشرة" : stops + " توقف") : " · " + (stops === 0 ? "Nonstop" : stops + " stop(s)"));
        details.textContent = route + time + stopText;
        const price = document.createElement("strong");
        const amount = item.price && item.price.amount;
        const currency = item.price && item.price.currency;
        price.textContent = amount !== undefined && currency ? new Intl.NumberFormat(lang === "ar" ? "ar-IQ" : "en-US", { style: "currency", currency }).format(Number(amount)) : (lang === "ar" ? "السعر غير متاح" : "Price unavailable");
        card.append(heading, details, price);
        if (item.requires_self_transfer) {
          const warning = document.createElement("p");
          warning.textContent = lang === "ar" ? "تنبيه: يتطلب هذا المسار انتقالًا ذاتيًا بين الرحلات." : "Warning: this itinerary requires a self-transfer.";
          card.append(warning);
        }
        return card;
      }));
    } catch {
      if (emptyText) emptyText.textContent = lang === "ar" ? "تعذّر الاتصال بخدمة البحث. تحقق من الاتصال وحاول مجددًا." : "Could not connect to flight search. Check your connection and try again.";
    }
  }

  applyLanguage();
  loadLiveFlights();
})();