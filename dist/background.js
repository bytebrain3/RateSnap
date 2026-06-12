//#region src/lib/exchangeRates.ts
var e = "exchangeRates", t = "https://openexchangerates.org/api/latest.json";
async function n(n) {
	let r = `${t}?app_id=${encodeURIComponent(n)}`, i = await fetch(r);
	if (!i.ok) {
		let e = await i.text();
		throw Error(`Failed to fetch rates: ${i.status} ${e}`);
	}
	let a = await i.json(), o = {
		rates: a.rates,
		timestamp: Date.now(),
		base: a.base || "USD"
	};
	return await chrome.storage.local.set({ [e]: o }), o;
}
async function r() {
	return (await chrome.storage.local.get(e))[e] || null;
}
function i(e, t) {
	let n = t * 60 * 1e3;
	return Date.now() - e > n;
}
async function a(e, t) {
	let a = await r();
	return a && !i(a.timestamp, t) ? a : n(e);
}
//#endregion
//#region src/lib/types.ts
var o = {
	apiKey: "",
	homeCurrencies: ["USD"],
	targetCurrencies: ["EUR", "GBP"],
	displayMode: "tooltip",
	refreshInterval: 60,
	dollarDefault: "USD",
	blacklistedSites: [],
	enableHighlight: !0,
	isSetupComplete: !1
}, s = "settings";
async function c() {
	let e = await chrome.storage.sync.get(s);
	return {
		...o,
		...e[s]
	};
}
//#endregion
//#region src/background/index.ts
var l = "refreshRates";
chrome.runtime.onInstalled.addListener(async (e) => {
	e.reason === "install" && chrome.tabs.create({ url: chrome.runtime.getURL("src/options/index.html") }), await u();
});
async function u() {
	let e = await c();
	await chrome.alarms.clear(l), chrome.alarms.create(l, { periodInMinutes: e.refreshInterval });
}
chrome.alarms.onAlarm.addListener(async (e) => {
	if (e.name === l) {
		let e = await c();
		if (e.apiKey) try {
			await n(e.apiKey);
		} catch (e) {
			console.error("[CurrencyConverter] Failed to refresh rates:", e);
		}
	}
}), chrome.runtime.onMessage.addListener((e, t, n) => (d(e).then(n).catch((e) => {
	n({
		success: !1,
		error: String(e)
	});
}), !0));
async function d(e) {
	switch (e.type) {
		case "GET_RATES": {
			let e = await c();
			return e.apiKey ? {
				success: !0,
				data: await a(e.apiKey, e.refreshInterval)
			} : {
				success: !1,
				error: "API key not configured"
			};
		}
		case "REFRESH_RATES": {
			let e = await c();
			return e.apiKey ? {
				success: !0,
				data: await n(e.apiKey)
			} : {
				success: !1,
				error: "API key not configured"
			};
		}
		case "GET_SETTINGS": return {
			success: !0,
			data: await c()
		};
		default: return {
			success: !1,
			error: "Unknown message type"
		};
	}
}
chrome.storage.onChanged.addListener((e, t) => {
	t === "sync" && e.settings && u();
});
//#endregion
