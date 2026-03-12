const n = "exchangeRates", g = "https://openexchangerates.org/api/latest.json";
async function o(e) {
  const t = `${g}?app_id=${encodeURIComponent(e)}`, s = await fetch(t);
  if (!s.ok) {
    const h = await s.text();
    throw new Error(`Failed to fetch rates: ${s.status} ${h}`);
  }
  const r = await s.json(), i = {
    rates: r.rates,
    timestamp: Date.now(),
    base: r.base || "USD"
  };
  return await chrome.storage.local.set({ [n]: i }), i;
}
async function f() {
  return (await chrome.storage.local.get(n))[n] || null;
}
function d(e, t) {
  const s = t * 60 * 1e3;
  return Date.now() - e > s;
}
async function m(e, t) {
  const s = await f();
  return s && !d(s.timestamp, t) ? s : o(e);
}
const y = {
  apiKey: "",
  homeCurrency: "USD",
  targetCurrencies: ["EUR", "GBP"],
  displayMode: "tooltip",
  refreshInterval: 60,
  dollarDefault: "USD",
  blacklistedSites: [],
  enableHighlight: !0,
  isSetupComplete: !1
}, u = "settings";
async function a() {
  const e = await chrome.storage.sync.get(u);
  return { ...y, ...e[u] };
}
const c = "refreshRates";
chrome.runtime.onInstalled.addListener(async (e) => {
  e.reason === "install" && chrome.tabs.create({
    url: chrome.runtime.getURL("src/options/index.html")
  }), await l();
});
async function l() {
  const e = await a();
  await chrome.alarms.clear(c), chrome.alarms.create(c, {
    periodInMinutes: e.refreshInterval
  });
}
chrome.alarms.onAlarm.addListener(async (e) => {
  if (e.name === c) {
    const t = await a();
    if (t.apiKey)
      try {
        await o(t.apiKey);
      } catch (s) {
        console.error("[CurrencyConverter] Failed to refresh rates:", s);
      }
  }
});
chrome.runtime.onMessage.addListener(
  (e, t, s) => (p(e).then(s).catch((r) => {
    s({ success: !1, error: String(r) });
  }), !0)
);
async function p(e) {
  switch (e.type) {
    case "GET_RATES": {
      const t = await a();
      return t.apiKey ? { success: !0, data: await m(
        t.apiKey,
        t.refreshInterval
      ) } : { success: !1, error: "API key not configured" };
    }
    case "REFRESH_RATES": {
      const t = await a();
      return t.apiKey ? { success: !0, data: await o(t.apiKey) } : { success: !1, error: "API key not configured" };
    }
    case "GET_SETTINGS":
      return { success: !0, data: await a() };
    default:
      return { success: !1, error: "Unknown message type" };
  }
}
chrome.storage.onChanged.addListener((e, t) => {
  t === "sync" && e.settings && l();
});
