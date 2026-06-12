//#region src/content/currencyMap.ts
var e = {
	$: "USD",
	"€": "EUR",
	"£": "GBP",
	"¥": "JPY",
	"₹": "INR",
	"৳": "BDT",
	"₩": "KRW",
	"₺": "TRY",
	"₽": "RUB",
	"₱": "PHP",
	"₪": "ILS",
	"₫": "VND",
	"₦": "NGN",
	"₴": "UAH",
	"฿": "THB",
	zł: "PLN",
	Kč: "CZK",
	Ft: "HUF",
	lei: "RON",
	лв: "BGN",
	kr: "SEK",
	R$: "BRL",
	"S/.": "PEN",
	RM: "MYR",
	Rp: "IDR",
	"₨": "PKR",
	Rs: "LKR",
	KSh: "KES",
	Fr: "CHF"
}, t = {
	US$: "USD",
	"US $": "USD",
	A$: "AUD",
	AU$: "AUD",
	C$: "CAD",
	CA$: "CAD",
	HK$: "HKD",
	S$: "SGD",
	NZ$: "NZD",
	MX$: "MXN",
	CL$: "CLP",
	AR$: "ARS",
	NT$: "TWD",
	COL$: "COP",
	"E£": "EGP"
}, n = new Set(/* @__PURE__ */ "USD.EUR.GBP.JPY.CNY.INR.BDT.AUD.CAD.CHF.HKD.SGD.SEK.KRW.NOK.NZD.MXN.ZAR.BRL.TRY.RUB.PLN.THB.IDR.MYR.PHP.CZK.ILS.CLP.PKR.AED.SAR.TWD.ARS.EGP.VND.NGN.KES.QAR.UAH.COP.RON.PEN.HUF.DKK.BGN.HRK.ISK.LKR.MMK".split(".")), r = {
	".au": "AUD",
	".com.au": "AUD",
	".ca": "CAD",
	".hk": "HKD",
	".sg": "SGD",
	".nz": "NZD",
	".mx": "MXN",
	".tw": "TWD",
	".ar": "ARS",
	".cl": "CLP",
	".co": "COP"
}, i = {
	".se": "SEK",
	".no": "NOK",
	".dk": "DKK",
	".is": "ISK"
};
function a(e) {
	let t = window.location.hostname;
	for (let [e, n] of Object.entries(r)) if (t.endsWith(e)) return n;
	return e || "USD";
}
function o() {
	let e = window.location.hostname;
	for (let [t, n] of Object.entries(i)) if (e.endsWith(t)) return n;
	return "SEK";
}
var s = `(?:${String.raw`\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?`}|${String.raw`\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?`}|${String.raw`\d+(?:[.,]\d{1,2})?`})`, c = Object.keys(e).concat(Object.keys(t)).sort((e, t) => t.length - e.length).map((e) => e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), l = Array.from(n).join("|"), u = RegExp(`(?:(?<prefixSymbol>${c})\\s?(?<prefixNum>${s})|(?<prefixCode>${l})\\s(?<prefixCodeNum>${s})|(?<suffixNum>${s})\\s?(?<suffixCode>${l}))`, "g");
function d(e) {
	let t = e.lastIndexOf("."), n = e.lastIndexOf(",");
	return t > -1 && n > -1 ? parseFloat(t > n ? e.replace(/,/g, "") : e.replace(/\./g, "").replace(",", ".")) : n > -1 && e.indexOf(",") === n ? e.substring(n + 1).length <= 2 ? parseFloat(e.replace(",", ".")) : parseFloat(e.replace(",", "")) : parseFloat(e.replace(/,/g, ""));
}
function f(n, r) {
	return t[n] ? t[n] : n === "$" ? a(r) : n === "kr" ? o() : e[n] || "USD";
}
//#endregion
//#region src/content/priceDetector.ts
var p = new Set([
	"SCRIPT",
	"STYLE",
	"NOSCRIPT",
	"IFRAME",
	"OBJECT",
	"EMBED",
	"SVG",
	"CANVAS",
	"VIDEO",
	"AUDIO",
	"INPUT",
	"TEXTAREA",
	"SELECT",
	"CODE",
	"PRE"
]), m = [
	"[class*=\"price\"]",
	"[itemprop=\"price\"]",
	"[data-price]",
	"[class*=\"amount\"]",
	"[class*=\"cost\"]"
].join(","), h = "data-cc-processed";
function g(e, t) {
	let r = [], i = document.createTreeWalker(e, NodeFilter.SHOW_TEXT, { acceptNode(e) {
		let t = e.parentElement;
		if (!t || p.has(t.tagName) || t.hasAttribute("data-cc-processed") || t.closest("[data-cc-processed]") || t.closest(".cc-ext-tooltip, .cc-ext-converted")) return NodeFilter.FILTER_REJECT;
		if (t.offsetParent === null && t.tagName !== "BODY") {
			let e = window.getComputedStyle(t).position;
			if (e !== "fixed" && e !== "sticky") return NodeFilter.FILTER_REJECT;
		}
		return (e.textContent || "").trim().length < 2 ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
	} }), a;
	for (; a = i.nextNode();) {
		let e = a.textContent || "", i = new RegExp(u.source, u.flags), o;
		for (; (o = i.exec(e)) !== null;) {
			let e = o.groups, i, s;
			if (e.prefixSymbol && e.prefixNum) i = f(e.prefixSymbol, t), s = e.prefixNum;
			else if (e.prefixCode && e.prefixCodeNum) i = e.prefixCode, s = e.prefixCodeNum;
			else if (e.suffixNum && e.suffixCode) i = e.suffixCode, s = e.suffixNum;
			else continue;
			if (!n.has(i)) continue;
			let c = d(s);
			isNaN(c) || c <= 0 || c > 999999999999 || r.push({
				node: a,
				currency: i,
				amount: c,
				originalText: o[0],
				startOffset: o.index,
				endOffset: o.index + o[0].length
			});
		}
	}
	return r;
}
function _(e, t) {
	if (!(e instanceof Element)) return [];
	let r = [], i = e.querySelectorAll(m);
	for (let e of i) {
		if (e.hasAttribute("data-cc-processed") || e.querySelector("[data-cc-processed]") || e.closest(".cc-ext-tooltip, .cc-ext-converted, .cc-ext-price-wrapper")) continue;
		let i = (e.textContent || "").replace(/\s+/g, " ").trim();
		if (!i || i.length < 2 || i.length > 80) continue;
		let a = new RegExp(u.source, u.flags), o;
		for (; (o = a.exec(i)) !== null;) {
			let i = o.groups, a = "", s = "";
			if (i.prefixSymbol && i.prefixNum) a = f(i.prefixSymbol, t), s = i.prefixNum;
			else if (i.prefixCode && i.prefixCodeNum) a = i.prefixCode, s = i.prefixCodeNum;
			else if (i.suffixNum && i.suffixCode) a = i.suffixCode, s = i.suffixNum;
			else continue;
			if (!n.has(a)) continue;
			let c = d(s);
			if (!(isNaN(c) || c <= 0 || c > 999999999999)) {
				r.push({
					node: null,
					element: e,
					currency: a,
					amount: c,
					originalText: o[0],
					startOffset: o.index,
					endOffset: o.index + o[0].length
				});
				break;
			}
		}
	}
	return r;
}
//#endregion
//#region src/content/converter.ts
function v(e, t, n, r, i) {
	if (t === n) return e;
	let a = t === i ? 1 : r[t], o = n === i ? 1 : r[n];
	return !a || !o ? NaN : e / a * o;
}
function y(e, t, n, r, i) {
	return n.filter((e) => e !== t).map((n) => {
		let a = v(e, t, n, r, i);
		return {
			targetCurrency: n,
			amount: a,
			formatted: b(a, n)
		};
	}).filter((e) => !isNaN(e.amount));
}
function b(e, t) {
	try {
		return new Intl.NumberFormat(void 0, {
			style: "currency",
			currency: t,
			minimumFractionDigits: 0,
			maximumFractionDigits: 2
		}).format(e);
	} catch {
		return `${t} ${e.toFixed(2)}`;
	}
}
//#endregion
//#region src/content/display.ts
var x = "cc-ext-tooltip", S = "cc-ext-converted", C = "cc-ext-price-wrapper", w = "data-cc-original", T = "data-cc-currency";
function E(e, t, n, r, i) {
	for (let a of e) {
		if (!a.element) continue;
		let e = a.element;
		if (e.hasAttribute("data-cc-processed")) continue;
		let o = y(a.amount, a.currency, t, n, r);
		if (o.length) if (e.setAttribute(h, "true"), i === "tooltip") {
			e.classList.add("cc-ext-has-tooltip"), window.getComputedStyle(e).position === "static" && (e.style.position = "relative");
			let t = document.createElement("span");
			t.className = x, t.innerHTML = o.map((e) => `<span class="cc-ext-tooltip-row"><span class="cc-ext-tooltip-currency">${e.targetCurrency}</span><span class="cc-ext-tooltip-amount">${e.formatted}</span></span>`).join(""), e.appendChild(t);
		} else {
			let t = D(o, e);
			if (!t) continue;
			let n = document.createElement("span");
			n.className = `${C} cc-ext-el-badge`, n.setAttribute(w, a.originalText), n.setAttribute(T, a.currency), n.textContent = ` -> ${t}`, e.insertAdjacentElement("afterend", n);
		}
	}
	let a = /* @__PURE__ */ new Map();
	for (let t of e) {
		if (!t.node) continue;
		let e = a.get(t.node) || [];
		e.push(t), a.set(t.node, e);
	}
	for (let [e, o] of a) {
		let a = [...o].sort((e, t) => t.startOffset - e.startOffset), s = e.parentElement;
		if (!s) continue;
		let c = e.textContent || "", l = document.createDocumentFragment(), u = c.length;
		for (let e of a) {
			let a = y(e.amount, e.currency, t, n, r);
			if (a.length === 0) continue;
			e.endOffset < u && l.prepend(document.createTextNode(c.slice(e.endOffset, u)));
			let o = k(e.originalText, e.currency, a, i);
			l.prepend(o), u = e.startOffset;
		}
		u > 0 && l.prepend(document.createTextNode(c.slice(0, u))), s.setAttribute(h, "true"), s.replaceChild(l, e);
	}
}
function D(e, t) {
	let n = e.map((e) => e.formatted).join(" / ");
	if (!n) return "";
	let r = t.getBoundingClientRect().width;
	if (!(r > 0 && r < 180)) return n;
	let i = e[0];
	return i ? O(i.amount, i.targetCurrency) : n;
}
function O(e, t) {
	try {
		return new Intl.NumberFormat(void 0, {
			style: "currency",
			currency: t,
			notation: "compact",
			maximumFractionDigits: 1
		}).format(e);
	} catch {
		return `${t} ${e.toFixed(1)}`;
	}
}
function k(e, t, n, r) {
	let i = document.createElement("span");
	if (i.className = C, i.setAttribute(w, e), i.setAttribute(T, t), r === "tooltip") {
		i.textContent = e, i.classList.add("cc-ext-has-tooltip");
		let t = document.createElement("span");
		t.className = x, t.innerHTML = n.map((e) => `<span class="cc-ext-tooltip-row"><span class="cc-ext-tooltip-currency">${e.targetCurrency}</span><span class="cc-ext-tooltip-amount">${e.formatted}</span></span>`).join(""), i.appendChild(t);
	} else {
		let t = n.map((e) => e.formatted).join(" / ");
		i.classList.add(S), i.textContent = t;
		let r = document.createElement("span");
		r.className = "cc-ext-original-badge", r.textContent = `(${e})`, i.appendChild(r);
	}
	return i;
}
function A(e = document.body) {
	e.querySelectorAll(".cc-ext-has-tooltip").forEach((e) => {
		e.querySelector(`.${x}`)?.remove(), e.classList.remove("cc-ext-has-tooltip"), e.style.position = "";
	}), e.querySelectorAll(".cc-ext-el-badge").forEach((e) => e.remove()), e.querySelectorAll(`.${C}:not(.cc-ext-el-badge)`).forEach((e) => {
		let t = e.getAttribute(w);
		if (t) {
			let n = document.createTextNode(t);
			e.parentNode?.replaceChild(n, e);
		}
	}), e.querySelectorAll(`[${h}]`).forEach((e) => e.removeAttribute(h));
}
//#endregion
//#region src/content/index.ts
var j = null, M = null, N = null, P = null;
async function F() {
	let e = await chrome.runtime.sendMessage({ type: "GET_SETTINGS" });
	if (!e?.success || !e.data || (j = e.data, !j.isSetupComplete)) return;
	let t = window.location.hostname;
	if (j.blacklistedSites.some((e) => t.includes(e))) return;
	let n = await chrome.runtime.sendMessage({ type: "GET_RATES" });
	!n?.success || !n.data || (M = n.data, I(document.body), L());
}
function I(e) {
	if (!j || !M || j.targetCurrencies.length === 0) return;
	let { dollarDefault: t, targetCurrencies: n, displayMode: r } = j, { rates: i, base: a } = M, o = _(e, t);
	o.length > 0 && E(o, n, i, a, r);
	let s = g(e, t);
	s.length > 0 && E(s, n, i, a, r);
}
function L() {
	N && N.disconnect(), N = new MutationObserver((e) => {
		P && clearTimeout(P), P = setTimeout(() => {
			let t = /* @__PURE__ */ new Set();
			for (let n of e) for (let e of n.addedNodes) if (e.nodeType === Node.ELEMENT_NODE || e.nodeType === Node.TEXT_NODE) {
				if (e instanceof Element && (e.classList.contains("cc-ext-tooltip") || e.classList.contains("cc-ext-converted") || e.classList.contains("cc-ext-price-wrapper"))) continue;
				t.add(e);
			}
			for (let e of t) {
				let t = e.nodeType === Node.TEXT_NODE ? e.parentElement : e;
				t && I(t);
			}
		}, 300);
	}), N.observe(document.body, {
		childList: !0,
		subtree: !0
	});
}
chrome.storage.onChanged.addListener((e, t) => {
	if (t === "sync" && e.settings) {
		let t = e.settings.newValue, n = !j || t.displayMode !== j.displayMode || t.targetCurrencies.join(",") !== j.targetCurrencies.join(",") || t.dollarDefault !== j.dollarDefault;
		j = t, n && (A(), I(document.body));
	}
}), F().catch((e) => {
	console.error("[CurrencyConverter] Init failed:", e);
});
//#endregion
