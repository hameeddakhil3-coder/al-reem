const API_BASE = "https://ignav.com/api";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/api/flights/search") {
      if (request.method !== "POST") {
        return json({ error: "method_not_allowed", message: "Use POST." }, 405);
      }
      if (!env.IGNAV_API_KEY) {
        return json({ error: "provider_not_configured", message: "Flight search is not configured yet." }, 503);
      }

      let input;
      try { input = await request.json(); }
      catch { return json({ error: "invalid_json", message: "Invalid JSON body." }, 400); }

      const origin = code(input.origin);
      const destination = code(input.destination);
      const departureDate = date(input.departure_date);
      const returnDate = input.return_date ? date(input.return_date) : null;
      const adults = Math.max(1, Math.min(9, Number.parseInt(input.adults, 10) || 1));
      const cabin = ["economy", "premium_economy", "business", "first"].includes(input.cabin_class) ? input.cabin_class : "economy";
      const market = /^[A-Za-z]{2}$/.test(input.market || "IQ") ? (input.market || "IQ").toUpperCase() : "IQ";

      if (!origin || !destination || origin === destination || !departureDate || (input.return_date && !returnDate) || (returnDate && returnDate < departureDate)) {
        return json({ error: "invalid_search", message: "Check origin, destination, and travel dates." }, 400);
      }

      const roundTrip = Boolean(returnDate);
      const endpoint = roundTrip ? "/fares/round-trip" : "/fares/one-way";
      const payload = { origin, destination, departure_date: departureDate, adults, cabin_class: cabin, market };
      if (returnDate) payload.return_date = returnDate;

      try {
        const upstream = await fetch(API_BASE + endpoint, {
          method: "POST",
          headers: { "X-Api-Key": env.IGNAV_API_KEY, "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await upstream.json().catch(() => ({}));
        if (!upstream.ok) {
          const status = upstream.status === 401 || upstream.status === 403 ? 502 : upstream.status === 402 ? 402 : 502;
          return json({
            error: "flight_provider_error",
            message: upstream.status === 402 ? "The provider requires billing or the free allowance is unavailable. No price was charged by this site." :
              upstream.status === 401 || upstream.status === 403 ? "The flight provider rejected the API key. Check the Cloudflare Secret." :
              "The flight provider could not complete this search. Please try again later."
          }, status);
        }
        const itineraries = Array.isArray(data.itineraries) ? data.itineraries : [];
        return json({
          origin: data.origin || origin,
          destination: data.destination || destination,
          departure_date: data.departure_date || departureDate,
          return_date: data.return_date || returnDate,
          observed_at: data.observed_at || null,
          itineraries: itineraries.slice(0, 30).map(item => ({
            ignav_id: item.ignav_id || null,
            price: item.price || null,
            outbound: item.outbound || null,
            inbound: item.inbound || null,
            legs: item.legs || null,
            cabin_class: item.cabin_class || cabin,
            requires_self_transfer: Boolean(item.requires_self_transfer)
          }))
        });
      } catch {
        return json({ error: "provider_unavailable", message: "Could not reach the flight provider. Please try again." }, 502);
      }
    }

    return env.ASSETS.fetch(request);
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" }
  });
}
function code(value) {
  const v = String(value || "").trim().toUpperCase();
  return /^[A-Z]{3}$/.test(v) ? v : "";
}
function date(value) {
  const v = String(value || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return "";
  const d = new Date(v + "T00:00:00Z");
  return !Number.isNaN(d.valueOf()) && d.toISOString().slice(0, 10) === v ? v : "";
}
