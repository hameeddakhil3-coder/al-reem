const API_BASE = "https://ignav.com/api";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/airports") {
      if (request.method !== "GET") return json({ error: "method_not_allowed" }, 405);
      if (!env.IGNAV_API_KEY) return json({ error: "provider_not_configured", message: "Airport search is not configured yet." }, 503);
      const q = (url.searchParams.get("q") || "").trim().slice(0, 80);
      if (q.length < 2) return json([]);
      try {
        const upstream = await fetch(API_BASE + "/airports?q=" + encodeURIComponent(q) + "&limit=8", {
          headers: { "X-Api-Key": env.IGNAV_API_KEY, "Accept": "application/json" }
        });
        if (!upstream.ok) return json({ error: "airport_search_failed", message: "Airport search is temporarily unavailable." }, 502);
        const data = await upstream.json();
        return json(Array.isArray(data) ? data.slice(0, 8).map(a => ({
          code: String(a.code || "").toUpperCase(),
          name: String(a.name || ""),
          city: String(a.city || ""),
          country: String(a.country || "")
        })).filter(a => /^[A-Z]{3}$/.test(a.code)) : []);
      } catch {
        return json({ error: "provider_unavailable", message: "Could not reach the airport provider." }, 502);
      }
    }

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
          // Return a safe diagnostic status, never the provider response body or API key.
          const status = upstream.status === 402 ? 402 : 502;
          const error = upstream.status === 401 || upstream.status === 403 ? "provider_auth_error" :
            upstream.status === 400 || upstream.status === 422 ? "provider_invalid_search" :
            upstream.status === 404 ? "provider_endpoint_error" :
            upstream.status === 429 ? "provider_rate_limited" :
            upstream.status === 402 ? "provider_billing_required" : "flight_provider_error";
          return json({
            error,
            provider_status: upstream.status,
            message: upstream.status === 402 ? "The provider requires billing or the free allowance is unavailable. No price was charged by this site." :
              upstream.status === 401 || upstream.status === 403 ? "The flight provider rejected the API key. Check the Cloudflare Secret." :
              upstream.status === 400 || upstream.status === 422 ? "The provider rejected these search details. Check the dates, route, and passenger options." :
              upstream.status === 404 ? "The configured flight search endpoint was not found." :
              upstream.status === 429 ? "The provider temporarily rate-limited this request. Please wait and try again." :
              "The flight provider could not complete this search. Please try again later."
          }, status);
        }
        const itineraries = Array.isArray(data.itineraries) ? data.itineraries : (Array.isArray(data.data?.itineraries) ? data.data.itineraries : (Array.isArray(data.results) ? data.results : (Array.isArray(data.data) ? data.data : [])));
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
