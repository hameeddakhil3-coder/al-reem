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
          market: "US"
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const messages = {
          provider_not_configured: lang === "ar" ? "خدمة البحث عن الرحلات غير مهيأة على الخادم بعد." : "Flight search is not configured on the server yet.",
          provider_auth_error: lang === "ar" ? "تعذّر التحقق من مفتاح مزوّد الرحلات. يلزم فحص السرّ في إعدادات Cloudflare." : "The flight provider API key was rejected. Check the Cloudflare secret.",
          provider_invalid_search: lang === "ar" ? "رفض مزوّد الرحلات تفاصيل البحث. تحقق من التاريخ والمسار وعدد المسافرين." : "The provider rejected these search details. Check the date, route, and passengers.",
          provider_endpoint_error: lang === "ar" ? "عنوان واجهة البحث لدى المزوّد غير صحيح أو غير متاح." : "The configured provider search endpoint was not found.",
          provider_rate_limited: lang === "ar" ? "طلبات البحث كثيرة مؤقتًا. انتظر قليلًا ثم حاول مجددًا." : "The provider temporarily rate-limited this request. Please wait and try again.",
          provider_billing_required: lang === "ar" ? "تتطلب خدمة المزوّد تفعيل الفوترة أو أن الحصة المجانية غير متاحة. لم يُخصم أي مبلغ من خلال هذا الموقع." : "The provider requires billing or the free allowance is unavailable. This site did not charge you.",
          flight_provider_error: lang === "ar" ? "لم يتمكن مزوّد الرحلات من إكمال البحث. رمز الاستجابة: " + (data.provider_status || "غير معروف") + ". يمكن استخدام طلب الحجز اليدوي مؤقتًا." : "The flight provider could not complete the search. Response status: " + (data.provider_status || "unknown") + ". You can use manual booking for now."
        };
        const message = messages[data.error] || (lang === "ar" ? "تعذّر إكمال البحث الآن. حاول لاحقًا." : "Search could not be completed. Please try again later.");
        if (emptyText) emptyText.textContent = message;
        return;
      }
      const receivedItineraries = Array.isArray(data.itineraries) ? data.itineraries : [];
      // Remove only exact duplicate offers; different prices, flight times, or routes remain visible.
      const seenOffers = new Set();
      const itineraries = receivedItineraries.filter(item => {
        const outbound = item.outbound || (Array.isArray(item.legs) ? item.legs[0] : {}) || {};
        const segments = Array.isArray(outbound.segments) ? outbound.segments : [];
        const key = JSON.stringify({
          id: item.ignav_id || null,
          carrier: outbound.carrier || outbound.airline || "",
          price: item.price ? [item.price.amount, item.price.currency] : null,
          segments: segments.map(segment => [
            segment.departure_airport, segment.arrival_airport,
            segment.departure_time_local || segment.departure_time,
            segment.arrival_time_local || segment.arrival_time
          ]),
          selfTransfer: Boolean(item.requires_self_transfer)
        });
        if (seenOffers.has(key)) return false;
        seenOffers.add(key);
        return true;
      });
      if (!itineraries.length) {
        if (emptyText) emptyText.textContent = lang === "ar" ? "لم يعثر المزوّد على عروض لهذه التفاصيل. جرّب تاريخًا أو مطارًا آخر." : "The provider returned no offers for these details. Try another date or airport.";
        return;
      }
      if (emptyText) emptyText.textContent = lang === "ar" ? "عروض الأسعار التي أعادها مزوّد الرحلات. السعر والتوافر قد يتغيران قبل الحجز." : "Fares returned by the flight provider. Price and availability may change before booking.";
      const title = document.getElementById("emptyTitle");
      if (title) title.textContent = lang === "ar" ? "عروض الرحلات المتاحة" : "Available flight offers";
      const icon = document.querySelector(".results-empty .empty-icon");
      if (icon) icon.hidden = true;
      const airlineLogoUrls = {
        "Air Arabia":"https://commons.wikimedia.org/wiki/Special:FilePath/Air%20Arabia%20logo%202018.svg",
        "SalamAir":"https://commons.wikimedia.org/wiki/Special:FilePath/SalamAir.png",
        "Qatar Airways":"https://commons.wikimedia.org/wiki/Special:FilePath/Qatar%20Airways%20logo.svg",
        "Royal Jordanian":"https://commons.wikimedia.org/wiki/Special:FilePath/Royal%20Jordanian%20Logo.svg",
        "Iraqi":"https://commons.wikimedia.org/wiki/Special:FilePath/Iraqi%20Airways%20Logo.svg",
        "Iraqi Airways":"https://commons.wikimedia.org/wiki/Special:FilePath/Iraqi%20Airways%20Logo.svg"
      };
      const airlineNames = {
        "Air Arabia": {ar:"العربية للطيران", initials:"AA"},
        "SalamAir": {ar:"سلام إير", initials:"SA"},
        "Qatar Airways": {ar:"الخطوط الجوية القطرية", initials:"QR"},
        "Royal Jordanian": {ar:"الملكية الأردنية", initials:"RJ"},
        "Iraqi": {ar:"الخطوط الجوية العراقية", initials:"IA"},
        "Iraqi Airways": {ar:"الخطوط الجوية العراقية", initials:"IA"},
        "Emirates": {ar:"طيران الإمارات", initials:"EK"},
        "Etihad Airways": {ar:"الاتحاد للطيران", initials:"EY"},
        "Turkish Airlines": {ar:"الخطوط الجوية التركية", initials:"TK"},
        "flydubai": {ar:"فلاي دبي", initials:"FZ"},
        "Pegasus Airlines": {ar:"طيران بيغاسوس", initials:"PC"}
      };
      const formatTime = value => {
        if (!value) return "";
        const d = new Date(value);
        return Number.isNaN(d.getTime()) ? String(value).replace("T"," ") : new Intl.DateTimeFormat(lang === "ar" ? "ar-IQ" : "en-GB", {dateStyle:"medium",timeStyle:"short"}).format(d);
      };
      const minutesBetween = (a,b) => {
        if (!a || !b) return null;
        const x = new Date(a).getTime(), y = new Date(b).getTime();
        if (!Number.isFinite(x) || !Number.isFinite(y) || y <= x) return null;
        return Math.round((y-x)/60000);
      };
      const durationLabel = minutes => minutes == null ? "" : (lang === "ar" ? (Math.floor(minutes/60) ? Math.floor(minutes/60)+" س " : "")+(minutes%60 ? (minutes%60)+" د" : "") : Math.floor(minutes/60)+"h "+String(minutes%60).padStart(2,"0")+"m");
      container.replaceChildren(...itineraries.map((item) => {
        const outbound = item.outbound || (Array.isArray(item.legs) ? item.legs[0] : {}) || {};
        const segments = Array.isArray(outbound.segments) ? outbound.segments : [];
        const first = segments[0] || {};
        const last = segments[segments.length - 1] || {};
        const rawCarrier = String(outbound.carrier || outbound.airline || "");
        const carrier = airlineNames[rawCarrier] || {ar:rawCarrier,initials:rawCarrier.split(/\s+/).map(w=>w[0]).join("").slice(0,3).toUpperCase() || "✈"};
        const card = document.createElement("article"); card.className = "flight-result-card";
        const top = document.createElement("div"); top.className = "flight-card-top";
        const logo = document.createElement("div"); logo.className = "airline-logo"; logo.setAttribute("aria-hidden","true"); logo.textContent = carrier.initials; if (airlineLogoUrls[rawCarrier]) { const logoImage = document.createElement("img"); logoImage.src = airlineLogoUrls[rawCarrier]; logoImage.alt = ""; logoImage.loading = "lazy"; logoImage.onerror = () => { logoImage.remove(); logo.textContent = carrier.initials; logo.classList.add("logo-fallback"); }; logo.replaceChildren(logoImage); }
        const airline = document.createElement("div"); airline.className = "airline-name";
        const heading = document.createElement("h3"); heading.textContent = lang === "ar" ? (carrier.ar || rawCarrier || "شركة طيران") : (rawCarrier || "Airline");
        const codeLine = document.createElement("span"); codeLine.className = "airline-subtitle"; codeLine.textContent = rawCarrier;
        airline.append(heading); if (lang === "ar" && rawCarrier && rawCarrier !== carrier.ar) airline.append(codeLine);
        top.append(logo,airline);
        const routeLine = document.createElement("div"); routeLine.className = "flight-route-line";
        const departure = document.createElement("div"); departure.className = "flight-time-block";
        const departTime = document.createElement("strong"); departTime.textContent = first.departure_time_local ? formatTime(first.departure_time_local) : (lang === "ar" ? "موعد المغادرة غير متاح" : "Departure time unavailable");
        const departAirport = document.createElement("span"); departAirport.textContent = first.departure_airport || originValue; departure.append(departTime,departAirport);
        const middle = document.createElement("div"); middle.className = "flight-route-middle";
        const duration = minutesBetween(first.departure_time_local || first.departure_time, last.arrival_time_local || last.arrival_time);
        const durationText = document.createElement("span"); durationText.className = "flight-duration"; durationText.textContent = durationLabel(duration) || (lang === "ar" ? "المدة غير متاحة" : "Duration unavailable");
        const line = document.createElement("span"); line.className = "flight-route-track"; line.setAttribute("aria-hidden","true");
        const stops = segments.length > 0 ? Math.max(0, segments.length - 1) : null;
        const stopText = document.createElement("span"); stopText.className = "flight-stop-label";
        stopText.textContent = stops === null ? (lang === "ar" ? "التوقفات غير محددة" : "Stops not provided") : stops === 0 ? (lang === "ar" ? "مباشرة" : "Nonstop") : (lang === "ar" ? stops+" توقف" : stops+" stop"+(stops>1?"s":""));
        middle.append(durationText,line,stopText);
        const arrival = document.createElement("div"); arrival.className = "flight-time-block flight-arrival";
        const arriveTime = document.createElement("strong"); arriveTime.textContent = last.arrival_time_local ? formatTime(last.arrival_time_local) : (lang === "ar" ? "موعد الوصول غير متاح" : "Arrival time unavailable");
        const arriveAirport = document.createElement("span"); arriveAirport.textContent = last.arrival_airport || destinationValue; arrival.append(arriveTime,arriveAirport); routeLine.append(departure,middle,arrival);
        const bottom = document.createElement("div"); bottom.className = "flight-card-bottom";
        const price = document.createElement("strong"); price.className = "flight-price";
        const amount = item.price && item.price.amount, currency = item.price && item.price.currency;
        price.textContent = amount !== undefined && currency ? new Intl.NumberFormat(lang === "ar" ? "ar-IQ" : "en-US", {style:"currency",currency}).format(Number(amount)) : (lang === "ar" ? "السعر غير متاح" : "Price unavailable");
        const select = document.createElement("button"); select.type = "button"; select.className = "button button-primary flight-select"; select.textContent = lang === "ar" ? "اختيار هذه الرحلة" : "Select this flight";
        select.addEventListener("click", () => {
          const bookingParams = new URLSearchParams(location.search);
          bookingParams.set("airline", rawCarrier);
          if (item.ignav_id) bookingParams.set("flightId", String(item.ignav_id));
          if (amount !== undefined) bookingParams.set("flightPrice", String(amount));
          if (currency) bookingParams.set("flightCurrency", String(currency));
          if (first.departure_time_local || first.departure_time) bookingParams.set("flightDeparture", String(first.departure_time_local || first.departure_time));
          if (last.arrival_time_local || last.arrival_time) bookingParams.set("flightArrival", String(last.arrival_time_local || last.arrival_time));
          if (duration !== null) bookingParams.set("flightDuration", String(duration));
          if (stops !== null) bookingParams.set("flightStops", String(stops));
          if (item.requires_self_transfer) bookingParams.set("flightSelfTransfer","1"); else bookingParams.delete("flightSelfTransfer");
          location.href = "./booking.html?" + bookingParams.toString();
        });
        bottom.append(price,select); card.append(top,routeLine,bottom);
        if (item.requires_self_transfer) { const warning = document.createElement("p"); warning.className = "flight-warning"; warning.textContent = lang === "ar" ? "تنبيه: يتطلب هذا المسار انتقالًا ذاتيًا بين الرحلات؛ راجع شروط الانتقال قبل المتابعة." : "Self-transfer required. Review transfer conditions before proceeding."; card.append(warning); }
        return card;
      }));
    } catch {
      if (emptyText) emptyText.textContent = lang === "ar" ? "تعذّر الاتصال بخدمة البحث. تحقق من الاتصال وحاول مجددًا." : "Could not connect to flight search. Check your connection and try again.";
    }
  }

  applyLanguage();
  loadLiveFlights();
})();