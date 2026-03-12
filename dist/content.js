const b = {
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
}, S = {
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
}, A = /* @__PURE__ */ new Set([
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
]), K = {
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
}, U = {
  ".se": "SEK",
  ".no": "NOK",
  ".dk": "DKK",
  ".is": "ISK"
};
function M(e) {
  const c = window.location.hostname;
  for (const [t, n] of Object.entries(K))
    if (c.endsWith(t)) return n;
  return e || "USD";
}
function v() {
  const e = window.location.hostname;
  for (const [c, t] of Object.entries(U))
    if (e.endsWith(c)) return t;
  return "SEK";
}
const G = String.raw`\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?`, H = String.raw`\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?`, B = String.raw`\d+(?:[.,]\d{1,2})?`, T = `(?:${G}|${H}|${B})`, j = Object.keys(b).concat(Object.keys(S)).sort((e, c) => c.length - e.length).map((e) => e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), k = j.join("|"), L = Array.from(A).join("|"), C = new RegExp(
  `(?:(?<prefixSymbol>${k})\\s?(?<prefixNum>${T})|(?<prefixCode>${L})\\s(?<prefixCodeNum>${T})|(?<suffixNum>${T})\\s?(?<suffixCode>${L}))`,
  "g"
);
function w(e) {
  const c = e.lastIndexOf("."), t = e.lastIndexOf(",");
  return c > -1 && t > -1 ? c > t ? parseFloat(e.replace(/,/g, "")) : parseFloat(e.replace(/\./g, "").replace(",", ".")) : t > -1 && e.indexOf(",") === t ? e.substring(t + 1).length <= 2 ? parseFloat(e.replace(",", ".")) : parseFloat(e.replace(",", "")) : parseFloat(e.replace(/,/g, ""));
}
function I(e, c) {
  return S[e] ? S[e] : e === "$" ? M(c) : e === "kr" ? v() : b[e] || "USD";
}
const Y = /* @__PURE__ */ new Set([
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
]), W = [
  '[class*="price"]',
  '[itemprop="price"]',
  "[data-price]",
  '[class*="amount"]',
  '[class*="cost"]'
].join(","), m = "data-cc-processed";
function X(e, c) {
  const t = [], n = document.createTreeWalker(e, NodeFilter.SHOW_TEXT, {
    acceptNode(s) {
      const o = s.parentElement;
      if (!o || Y.has(o.tagName) || o.hasAttribute(m) || o.closest(`[${m}]`) || o.closest(".cc-ext-tooltip, .cc-ext-converted"))
        return NodeFilter.FILTER_REJECT;
      if (o.offsetParent === null && o.tagName !== "BODY") {
        const i = window.getComputedStyle(o).position;
        if (i !== "fixed" && i !== "sticky")
          return NodeFilter.FILTER_REJECT;
      }
      return (s.textContent || "").trim().length < 2 ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
    }
  });
  let r;
  for (; r = n.nextNode(); ) {
    const s = r.textContent || "", o = new RegExp(C.source, C.flags);
    let a;
    for (; (a = o.exec(s)) !== null; ) {
      const i = a.groups;
      let l, u;
      if (i.prefixSymbol && i.prefixNum)
        l = I(i.prefixSymbol, c), u = i.prefixNum;
      else if (i.prefixCode && i.prefixCodeNum)
        l = i.prefixCode, u = i.prefixCodeNum;
      else if (i.suffixNum && i.suffixCode)
        l = i.suffixCode, u = i.suffixNum;
      else
        continue;
      if (!A.has(l)) continue;
      const d = w(u);
      isNaN(d) || d <= 0 || d > 999999999999 || t.push({
        node: r,
        currency: l,
        amount: d,
        originalText: a[0],
        startOffset: a.index,
        endOffset: a.index + a[0].length
      });
    }
  }
  return t;
}
function J(e, c) {
  if (!(e instanceof Element)) return [];
  const t = [], n = e.querySelectorAll(W);
  for (const r of n) {
    if (r.hasAttribute(m) || r.querySelector(`[${m}]`) || r.closest(".cc-ext-tooltip, .cc-ext-converted, .cc-ext-price-wrapper"))
      continue;
    const s = (r.textContent || "").replace(/\s+/g, " ").trim();
    if (!s || s.length < 2 || s.length > 80) continue;
    const o = new RegExp(C.source, C.flags);
    let a;
    for (; (a = o.exec(s)) !== null; ) {
      const i = a.groups;
      let l = "", u = "";
      if (i.prefixSymbol && i.prefixNum)
        l = I(i.prefixSymbol, c), u = i.prefixNum;
      else if (i.prefixCode && i.prefixCodeNum)
        l = i.prefixCode, u = i.prefixCodeNum;
      else if (i.suffixNum && i.suffixCode)
        l = i.suffixCode, u = i.suffixNum;
      else continue;
      if (!A.has(l)) continue;
      const d = w(u);
      if (!(isNaN(d) || d <= 0 || d > 999999999999)) {
        t.push({
          node: null,
          element: r,
          currency: l,
          amount: d,
          originalText: a[0],
          startOffset: a.index,
          endOffset: a.index + a[0].length
        });
        break;
      }
    }
  }
  return t;
}
function q(e, c, t, n, r) {
  if (c === t) return e;
  const s = c === r ? 1 : n[c], o = t === r ? 1 : n[t];
  return !s || !o ? NaN : e / s * o;
}
function P(e, c, t, n, r) {
  return t.filter((s) => s !== c).map((s) => {
    const o = q(e, c, s, n, r);
    return {
      targetCurrency: s,
      amount: o,
      formatted: V(o, s)
    };
  }).filter((s) => !isNaN(s.amount));
}
function V(e, c) {
  try {
    return new Intl.NumberFormat(void 0, {
      style: "currency",
      currency: c,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(e);
  } catch {
    return `${c} ${e.toFixed(2)}`;
  }
}
const D = "cc-ext-tooltip", Z = "cc-ext-converted", h = "cc-ext-price-wrapper", O = "data-cc-original", _ = "data-cc-currency";
function $(e, c, t, n, r) {
  for (const o of e) {
    if (!o.element) continue;
    const a = o.element;
    if (a.hasAttribute(m)) continue;
    const i = P(
      o.amount,
      o.currency,
      c,
      t,
      n
    );
    if (i.length)
      if (a.setAttribute(m, "true"), r === "tooltip") {
        a.classList.add("cc-ext-has-tooltip"), window.getComputedStyle(a).position === "static" && (a.style.position = "relative");
        const l = document.createElement("span");
        l.className = D, l.innerHTML = i.map(
          (u) => `<span class="cc-ext-tooltip-row"><span class="cc-ext-tooltip-currency">${u.targetCurrency}</span><span class="cc-ext-tooltip-amount">${u.formatted}</span></span>`
        ).join(""), a.appendChild(l);
      } else {
        const l = document.createElement("span");
        l.className = `${h} cc-ext-el-badge`, l.setAttribute(O, o.originalText), l.setAttribute(_, o.currency), l.textContent = " → " + i.map((u) => u.formatted).join(" / "), a.insertAdjacentElement("afterend", l);
      }
  }
  const s = /* @__PURE__ */ new Map();
  for (const o of e) {
    if (!o.node) continue;
    const a = s.get(o.node) || [];
    a.push(o), s.set(o.node, a);
  }
  for (const [o, a] of s) {
    const i = [...a].sort(
      (p, E) => E.startOffset - p.startOffset
    ), l = o.parentElement;
    if (!l) continue;
    const u = o.textContent || "", d = document.createDocumentFragment();
    let N = u.length;
    for (const p of i) {
      const E = P(
        p.amount,
        p.currency,
        c,
        t,
        n
      );
      if (E.length === 0) continue;
      p.endOffset < N && d.prepend(
        document.createTextNode(u.slice(p.endOffset, N))
      );
      const F = z(
        p.originalText,
        p.currency,
        E,
        r
      );
      d.prepend(F), N = p.startOffset;
    }
    N > 0 && d.prepend(document.createTextNode(u.slice(0, N))), l.setAttribute(m, "true"), l.replaceChild(d, o);
  }
}
function z(e, c, t, n) {
  const r = document.createElement("span");
  if (r.className = h, r.setAttribute(O, e), r.setAttribute(_, c), n === "tooltip") {
    r.textContent = e, r.classList.add("cc-ext-has-tooltip");
    const s = document.createElement("span");
    s.className = D, s.innerHTML = t.map(
      (o) => `<span class="cc-ext-tooltip-row"><span class="cc-ext-tooltip-currency">${o.targetCurrency}</span><span class="cc-ext-tooltip-amount">${o.formatted}</span></span>`
    ).join(""), r.appendChild(s);
  } else {
    const s = t.map((a) => a.formatted).join(" / ");
    r.classList.add(Z), r.textContent = s;
    const o = document.createElement("span");
    o.className = "cc-ext-original-badge", o.textContent = `(${e})`, r.appendChild(o);
  }
  return r;
}
function Q(e = document.body) {
  e.querySelectorAll(".cc-ext-has-tooltip").forEach((n) => {
    var r;
    (r = n.querySelector(`.${D}`)) == null || r.remove(), n.classList.remove("cc-ext-has-tooltip"), n.style.position = "";
  }), e.querySelectorAll(".cc-ext-el-badge").forEach((n) => n.remove()), e.querySelectorAll(
    `.${h}:not(.cc-ext-el-badge)`
  ).forEach((n) => {
    var s;
    const r = n.getAttribute(O);
    if (r) {
      const o = document.createTextNode(r);
      (s = n.parentNode) == null || s.replaceChild(o, n);
    }
  }), e.querySelectorAll(`[${m}]`).forEach((n) => n.removeAttribute(m));
}
let f = null, g = null, x = null, R = null;
async function ee() {
  const e = await chrome.runtime.sendMessage({
    type: "GET_SETTINGS"
  });
  if (!(e != null && e.success) || !e.data || (f = e.data, !f.isSetupComplete)) return;
  const c = window.location.hostname;
  if (f.blacklistedSites.some((n) => c.includes(n)))
    return;
  const t = await chrome.runtime.sendMessage({ type: "GET_RATES" });
  !(t != null && t.success) || !t.data || (g = t.data, y(document.body), te());
}
function y(e) {
  if (!f || !g || f.targetCurrencies.length === 0) return;
  const { dollarDefault: c, targetCurrencies: t, displayMode: n } = f, { rates: r, base: s } = g, o = J(e, c);
  o.length > 0 && $(
    o,
    t,
    r,
    s,
    n
  );
  const a = X(e, c);
  a.length > 0 && $(a, t, r, s, n);
}
function te() {
  x && x.disconnect(), x = new MutationObserver((e) => {
    R && clearTimeout(R), R = setTimeout(() => {
      const c = /* @__PURE__ */ new Set();
      for (const t of e)
        for (const n of t.addedNodes)
          if (n.nodeType === Node.ELEMENT_NODE || n.nodeType === Node.TEXT_NODE) {
            if (n instanceof Element && (n.classList.contains("cc-ext-tooltip") || n.classList.contains("cc-ext-converted") || n.classList.contains("cc-ext-price-wrapper")))
              continue;
            c.add(n);
          }
      for (const t of c) {
        const n = t.nodeType === Node.TEXT_NODE ? t.parentElement : t;
        n && y(n);
      }
    }, 300);
  }), x.observe(document.body, {
    childList: !0,
    subtree: !0
  });
}
chrome.storage.onChanged.addListener((e, c) => {
  if (c === "sync" && e.settings) {
    const t = e.settings.newValue, n = !f || t.displayMode !== f.displayMode || t.targetCurrencies.join(",") !== f.targetCurrencies.join(",") || t.dollarDefault !== f.dollarDefault;
    f = t, n && (Q(), y(document.body));
  }
});
ee().catch((e) => {
  console.error("[CurrencyConverter] Init failed:", e);
});
