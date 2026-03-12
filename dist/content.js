const O = {
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
  // also NOK, DKK, ISK — disambiguated by TLD
  R$: "BRL",
  "S/.": "PEN",
  RM: "MYR",
  Rp: "IDR",
  "₨": "PKR",
  Rs: "LKR",
  KSh: "KES",
  Fr: "CHF"
}, D = {
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
}, L = /* @__PURE__ */ new Set([
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "CNY",
  "INR",
  "BDT",
  "AUD",
  "CAD",
  "CHF",
  "HKD",
  "SGD",
  "SEK",
  "KRW",
  "NOK",
  "NZD",
  "MXN",
  "ZAR",
  "BRL",
  "TRY",
  "RUB",
  "PLN",
  "THB",
  "IDR",
  "MYR",
  "PHP",
  "CZK",
  "ILS",
  "CLP",
  "PKR",
  "AED",
  "SAR",
  "TWD",
  "ARS",
  "EGP",
  "VND",
  "NGN",
  "KES",
  "QAR",
  "UAH",
  "COP",
  "RON",
  "PEN",
  "HUF",
  "DKK",
  "BGN",
  "HRK",
  "ISK",
  "LKR",
  "MMK"
]), _ = {
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
}, $ = {
  ".se": "SEK",
  ".no": "NOK",
  ".dk": "DKK",
  ".is": "ISK"
};
function I(e) {
  const n = window.location.hostname;
  for (const [t, o] of Object.entries(_))
    if (n.endsWith(t)) return o;
  return e || "USD";
}
function F() {
  const e = window.location.hostname;
  for (const [n, t] of Object.entries($))
    if (e.endsWith(n)) return t;
  return "SEK";
}
const K = String.raw`\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?`, w = String.raw`\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?`, U = String.raw`\d+(?:[.,]\d{1,2})?`, R = `(?:${K}|${w}|${U})`, b = Object.keys(O).concat(Object.keys(D)).sort((e, n) => n.length - e.length).map((e) => e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), M = b.join("|"), A = Array.from(L).join("|"), g = new RegExp(
  `(?:(?<prefixSymbol>${M})\\s?(?<prefixNum>${R})|(?<prefixCode>${A})\\s(?<prefixCodeNum>${R})|(?<suffixNum>${R})\\s?(?<suffixCode>${A}))`,
  "g"
);
function v(e) {
  const n = e.lastIndexOf("."), t = e.lastIndexOf(",");
  return n > -1 && t > -1 ? n > t ? parseFloat(e.replace(/,/g, "")) : parseFloat(e.replace(/\./g, "").replace(",", ".")) : t > -1 && e.indexOf(",") === t ? e.substring(t + 1).length <= 2 ? parseFloat(e.replace(",", ".")) : parseFloat(e.replace(",", "")) : parseFloat(e.replace(/,/g, ""));
}
function G(e, n) {
  return D[e] ? D[e] : e === "$" ? I(n) : e === "kr" ? F() : O[e] || "USD";
}
const H = /* @__PURE__ */ new Set([
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
]), T = "data-cc-processed";
function B(e, n) {
  const t = [], o = document.createTreeWalker(e, NodeFilter.SHOW_TEXT, {
    acceptNode(c) {
      const r = c.parentElement;
      return !r || H.has(r.tagName) || r.hasAttribute(T) || r.closest(".cc-ext-tooltip, .cc-ext-converted") || r.offsetParent === null && r.tagName !== "BODY" || (c.textContent || "").trim().length < 2 ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
    }
  });
  let s;
  for (; s = o.nextNode(); ) {
    const c = s.textContent || "", r = new RegExp(g.source, g.flags);
    let i;
    for (; (i = r.exec(c)) !== null; ) {
      const a = i.groups;
      let l, p;
      if (a.prefixSymbol && a.prefixNum)
        l = G(a.prefixSymbol, n), p = a.prefixNum;
      else if (a.prefixCode && a.prefixCodeNum)
        l = a.prefixCode, p = a.prefixCodeNum;
      else if (a.suffixNum && a.suffixCode)
        l = a.suffixCode, p = a.suffixNum;
      else
        continue;
      if (!L.has(l)) continue;
      const u = v(p);
      isNaN(u) || u <= 0 || u > 999999999999 || t.push({
        node: s,
        currency: l,
        amount: u,
        originalText: i[0],
        startOffset: i.index,
        endOffset: i.index + i[0].length
      });
    }
  }
  return t;
}
function Y(e, n, t, o, s) {
  if (n === t) return e;
  const c = n === s ? 1 : o[n], r = t === s ? 1 : o[t];
  return !c || !r ? NaN : e / c * r;
}
function j(e, n, t, o, s) {
  return t.filter((c) => c !== n).map((c) => {
    const r = Y(e, n, c, o, s);
    return {
      targetCurrency: c,
      amount: r,
      formatted: W(r, c)
    };
  }).filter((c) => !isNaN(c.amount));
}
function W(e, n) {
  try {
    return new Intl.NumberFormat(void 0, {
      style: "currency",
      currency: n,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(e);
  } catch {
    return `${n} ${e.toFixed(2)}`;
  }
}
const X = "cc-ext-tooltip", k = "cc-ext-converted", P = "cc-ext-price-wrapper", h = "data-cc-original", J = "data-cc-currency";
function V(e, n, t, o, s) {
  const c = /* @__PURE__ */ new Map();
  for (const r of e) {
    const i = c.get(r.node) || [];
    i.push(r), c.set(r.node, i);
  }
  for (const [r, i] of c) {
    const a = [...i].sort(
      (f, E) => E.startOffset - f.startOffset
    ), l = r.parentElement;
    if (!l) continue;
    const p = r.textContent || "", u = document.createDocumentFragment();
    let N = p.length;
    for (const f of a) {
      const E = j(
        f.amount,
        f.currency,
        n,
        t,
        o
      );
      if (E.length === 0) continue;
      f.endOffset < N && u.prepend(
        document.createTextNode(p.slice(f.endOffset, N))
      );
      const y = Z(
        f.originalText,
        f.currency,
        E,
        s
      );
      u.prepend(y), N = f.startOffset;
    }
    N > 0 && u.prepend(document.createTextNode(p.slice(0, N))), l.setAttribute(T, "true"), l.replaceChild(u, r);
  }
}
function Z(e, n, t, o) {
  const s = document.createElement("span");
  if (s.className = P, s.setAttribute(h, e), s.setAttribute(J, n), o === "tooltip") {
    s.textContent = e, s.classList.add("cc-ext-has-tooltip");
    const c = document.createElement("span");
    c.className = X, c.innerHTML = t.map(
      (r) => `<span class="cc-ext-tooltip-row"><span class="cc-ext-tooltip-currency">${r.targetCurrency}</span><span class="cc-ext-tooltip-amount">${r.formatted}</span></span>`
    ).join(""), s.appendChild(c);
  } else {
    const c = t.map((i) => i.formatted).join(" / ");
    s.classList.add(k), s.textContent = c;
    const r = document.createElement("span");
    r.className = "cc-ext-original-badge", r.textContent = `(${e})`, s.appendChild(r);
  }
  return s;
}
function q(e = document.body) {
  e.querySelectorAll(`.${P}`).forEach((o) => {
    var c;
    const s = o.getAttribute(h);
    if (s) {
      const r = document.createTextNode(s);
      (c = o.parentNode) == null || c.replaceChild(r, o);
    }
  }), e.querySelectorAll(`[${T}]`).forEach((o) => o.removeAttribute(T));
}
let d = null, m = null, C = null, x = null;
async function z() {
  const e = await chrome.runtime.sendMessage({
    type: "GET_SETTINGS"
  });
  if (!(e != null && e.success) || !e.data || (d = e.data, !d.isSetupComplete)) return;
  const n = window.location.hostname;
  if (d.blacklistedSites.some((o) => n.includes(o)))
    return;
  const t = await chrome.runtime.sendMessage({ type: "GET_RATES" });
  !(t != null && t.success) || !t.data || (m = t.data, S(document.body), Q());
}
function S(e) {
  if (!d || !m || d.targetCurrencies.length === 0) return;
  const n = B(e, d.dollarDefault);
  n.length !== 0 && V(
    n,
    d.targetCurrencies,
    m.rates,
    m.base,
    d.displayMode
  );
}
function Q() {
  C && C.disconnect(), C = new MutationObserver((e) => {
    x && clearTimeout(x), x = setTimeout(() => {
      const n = /* @__PURE__ */ new Set();
      for (const t of e)
        for (const o of t.addedNodes)
          if (o.nodeType === Node.ELEMENT_NODE || o.nodeType === Node.TEXT_NODE) {
            if (o instanceof Element && (o.classList.contains("cc-ext-tooltip") || o.classList.contains("cc-ext-converted") || o.classList.contains("cc-ext-price-wrapper")))
              continue;
            n.add(o);
          }
      for (const t of n) {
        const o = t.nodeType === Node.TEXT_NODE ? t.parentElement : t;
        o && S(o);
      }
    }, 300);
  }), C.observe(document.body, {
    childList: !0,
    subtree: !0
  });
}
chrome.storage.onChanged.addListener((e, n) => {
  if (n === "sync" && e.settings) {
    const t = e.settings.newValue, o = !d || t.displayMode !== d.displayMode || t.targetCurrencies.join(",") !== d.targetCurrencies.join(",") || t.dollarDefault !== d.dollarDefault;
    d = t, o && (q(), S(document.body));
  }
});
z().catch((e) => {
  console.error("[CurrencyConverter] Init failed:", e);
});
