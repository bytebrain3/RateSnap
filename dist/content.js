const w = {
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
}, g = {
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
  const r = window.location.hostname;
  for (const [t, n] of Object.entries(K))
    if (r.endsWith(t)) return n;
  return e || "USD";
}
function v() {
  const e = window.location.hostname;
  for (const [r, t] of Object.entries(U))
    if (e.endsWith(r)) return t;
  return "SEK";
}
const G = String.raw`\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?`, H = String.raw`\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?`, B = String.raw`\d+(?:[.,]\d{1,2})?`, T = `(?:${G}|${H}|${B})`, j = Object.keys(w).concat(Object.keys(g)).sort((e, r) => r.length - e.length).map((e) => e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), k = j.join("|"), L = Array.from(A).join("|"), E = new RegExp(
  `(?:(?<prefixSymbol>${k})\\s?(?<prefixNum>${T})|(?<prefixCode>${L})\\s(?<prefixCodeNum>${T})|(?<suffixNum>${T})\\s?(?<suffixCode>${L}))`,
  "g"
);
function b(e) {
  const r = e.lastIndexOf("."), t = e.lastIndexOf(",");
  return r > -1 && t > -1 ? r > t ? parseFloat(e.replace(/,/g, "")) : parseFloat(e.replace(/\./g, "").replace(",", ".")) : t > -1 && e.indexOf(",") === t ? e.substring(t + 1).length <= 2 ? parseFloat(e.replace(",", ".")) : parseFloat(e.replace(",", "")) : parseFloat(e.replace(/,/g, ""));
}
function I(e, r) {
  return g[e] ? g[e] : e === "$" ? M(r) : e === "kr" ? v() : w[e] || "USD";
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
function X(e, r) {
  const t = [], n = document.createTreeWalker(e, NodeFilter.SHOW_TEXT, {
    acceptNode(c) {
      const o = c.parentElement;
      if (!o || Y.has(o.tagName) || o.hasAttribute(m) || o.closest(`[${m}]`) || o.closest(".cc-ext-tooltip, .cc-ext-converted"))
        return NodeFilter.FILTER_REJECT;
      if (o.offsetParent === null && o.tagName !== "BODY") {
        const i = window.getComputedStyle(o).position;
        if (i !== "fixed" && i !== "sticky")
          return NodeFilter.FILTER_REJECT;
      }
      return (c.textContent || "").trim().length < 2 ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
    }
  });
  let s;
  for (; s = n.nextNode(); ) {
    const c = s.textContent || "", o = new RegExp(E.source, E.flags);
    let a;
    for (; (a = o.exec(c)) !== null; ) {
      const i = a.groups;
      let l, u;
      if (i.prefixSymbol && i.prefixNum)
        l = I(i.prefixSymbol, r), u = i.prefixNum;
      else if (i.prefixCode && i.prefixCodeNum)
        l = i.prefixCode, u = i.prefixCodeNum;
      else if (i.suffixNum && i.suffixCode)
        l = i.suffixCode, u = i.suffixNum;
      else
        continue;
      if (!A.has(l)) continue;
      const d = b(u);
      isNaN(d) || d <= 0 || d > 999999999999 || t.push({
        node: s,
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
function J(e, r) {
  if (!(e instanceof Element)) return [];
  const t = [], n = e.querySelectorAll(W);
  for (const s of n) {
    if (s.hasAttribute(m) || s.querySelector(`[${m}]`) || s.closest(".cc-ext-tooltip, .cc-ext-converted, .cc-ext-price-wrapper"))
      continue;
    const c = (s.textContent || "").replace(/\s+/g, " ").trim();
    if (!c || c.length < 2 || c.length > 80) continue;
    const o = new RegExp(E.source, E.flags);
    let a;
    for (; (a = o.exec(c)) !== null; ) {
      const i = a.groups;
      let l = "", u = "";
      if (i.prefixSymbol && i.prefixNum)
        l = I(i.prefixSymbol, r), u = i.prefixNum;
      else if (i.prefixCode && i.prefixCodeNum)
        l = i.prefixCode, u = i.prefixCodeNum;
      else if (i.suffixNum && i.suffixCode)
        l = i.suffixCode, u = i.suffixNum;
      else continue;
      if (!A.has(l)) continue;
      const d = b(u);
      if (!(isNaN(d) || d <= 0 || d > 999999999999)) {
        t.push({
          node: null,
          element: s,
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
function q(e, r, t, n, s) {
  if (r === t) return e;
  const c = r === s ? 1 : n[r], o = t === s ? 1 : n[t];
  return !c || !o ? NaN : e / c * o;
}
function P(e, r, t, n, s) {
  return t.filter((c) => c !== r).map((c) => {
    const o = q(e, r, c, n, s);
    return {
      targetCurrency: c,
      amount: o,
      formatted: V(o, c)
    };
  }).filter((c) => !isNaN(c.amount));
}
function V(e, r) {
  try {
    return new Intl.NumberFormat(void 0, {
      style: "currency",
      currency: r,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(e);
  } catch {
    return `${r} ${e.toFixed(2)}`;
  }
}
const D = "cc-ext-tooltip", Z = "cc-ext-converted", h = "cc-ext-price-wrapper", y = "data-cc-original", _ = "data-cc-currency";
function $(e, r, t, n, s) {
  for (const o of e) {
    if (!o.element) continue;
    const a = o.element;
    if (a.hasAttribute(m)) continue;
    const i = P(
      o.amount,
      o.currency,
      r,
      t,
      n
    );
    if (i.length)
      if (a.setAttribute(m, "true"), s === "tooltip") {
        a.classList.add("cc-ext-has-tooltip"), window.getComputedStyle(a).position === "static" && (a.style.position = "relative");
        const l = document.createElement("span");
        l.className = D, l.innerHTML = i.map(
          (u) => `<span class="cc-ext-tooltip-row"><span class="cc-ext-tooltip-currency">${u.targetCurrency}</span><span class="cc-ext-tooltip-amount">${u.formatted}</span></span>`
        ).join(""), a.appendChild(l);
      } else {
        const l = z(i, a);
        if (!l) continue;
        const u = document.createElement("span");
        u.className = `${h} cc-ext-el-badge`, u.setAttribute(y, o.originalText), u.setAttribute(_, o.currency), u.textContent = ` -> ${l}`, a.insertAdjacentElement("afterend", u);
      }
  }
  const c = /* @__PURE__ */ new Map();
  for (const o of e) {
    if (!o.node) continue;
    const a = c.get(o.node) || [];
    a.push(o), c.set(o.node, a);
  }
  for (const [o, a] of c) {
    const i = [...a].sort(
      (p, x) => x.startOffset - p.startOffset
    ), l = o.parentElement;
    if (!l) continue;
    const u = o.textContent || "", d = document.createDocumentFragment();
    let N = u.length;
    for (const p of i) {
      const x = P(
        p.amount,
        p.currency,
        r,
        t,
        n
      );
      if (x.length === 0) continue;
      p.endOffset < N && d.prepend(
        document.createTextNode(u.slice(p.endOffset, N))
      );
      const F = ee(
        p.originalText,
        p.currency,
        x,
        s
      );
      d.prepend(F), N = p.startOffset;
    }
    N > 0 && d.prepend(document.createTextNode(u.slice(0, N))), l.setAttribute(m, "true"), l.replaceChild(d, o);
  }
}
function z(e, r) {
  const t = e.map((o) => o.formatted).join(" / ");
  if (!t) return "";
  const n = r.getBoundingClientRect().width;
  if (!(n > 0 && n < 180)) return t;
  const c = e[0];
  return c ? Q(c.amount, c.targetCurrency) : t;
}
function Q(e, r) {
  try {
    return new Intl.NumberFormat(void 0, {
      style: "currency",
      currency: r,
      notation: "compact",
      maximumFractionDigits: 1
    }).format(e);
  } catch {
    return `${r} ${e.toFixed(1)}`;
  }
}
function ee(e, r, t, n) {
  const s = document.createElement("span");
  if (s.className = h, s.setAttribute(y, e), s.setAttribute(_, r), n === "tooltip") {
    s.textContent = e, s.classList.add("cc-ext-has-tooltip");
    const c = document.createElement("span");
    c.className = D, c.innerHTML = t.map(
      (o) => `<span class="cc-ext-tooltip-row"><span class="cc-ext-tooltip-currency">${o.targetCurrency}</span><span class="cc-ext-tooltip-amount">${o.formatted}</span></span>`
    ).join(""), s.appendChild(c);
  } else {
    const c = t.map((a) => a.formatted).join(" / ");
    s.classList.add(Z), s.textContent = c;
    const o = document.createElement("span");
    o.className = "cc-ext-original-badge", o.textContent = `(${e})`, s.appendChild(o);
  }
  return s;
}
function te(e = document.body) {
  e.querySelectorAll(".cc-ext-has-tooltip").forEach((n) => {
    var s;
    (s = n.querySelector(`.${D}`)) == null || s.remove(), n.classList.remove("cc-ext-has-tooltip"), n.style.position = "";
  }), e.querySelectorAll(".cc-ext-el-badge").forEach((n) => n.remove()), e.querySelectorAll(
    `.${h}:not(.cc-ext-el-badge)`
  ).forEach((n) => {
    var c;
    const s = n.getAttribute(y);
    if (s) {
      const o = document.createTextNode(s);
      (c = n.parentNode) == null || c.replaceChild(o, n);
    }
  }), e.querySelectorAll(`[${m}]`).forEach((n) => n.removeAttribute(m));
}
let f = null, S = null, C = null, R = null;
async function ne() {
  const e = await chrome.runtime.sendMessage({
    type: "GET_SETTINGS"
  });
  if (!(e != null && e.success) || !e.data || (f = e.data, !f.isSetupComplete)) return;
  const r = window.location.hostname;
  if (f.blacklistedSites.some((n) => r.includes(n)))
    return;
  const t = await chrome.runtime.sendMessage({ type: "GET_RATES" });
  !(t != null && t.success) || !t.data || (S = t.data, O(document.body), oe());
}
function O(e) {
  if (!f || !S || f.targetCurrencies.length === 0) return;
  const { dollarDefault: r, targetCurrencies: t, displayMode: n } = f, { rates: s, base: c } = S, o = J(e, r);
  o.length > 0 && $(
    o,
    t,
    s,
    c,
    n
  );
  const a = X(e, r);
  a.length > 0 && $(a, t, s, c, n);
}
function oe() {
  C && C.disconnect(), C = new MutationObserver((e) => {
    R && clearTimeout(R), R = setTimeout(() => {
      const r = /* @__PURE__ */ new Set();
      for (const t of e)
        for (const n of t.addedNodes)
          if (n.nodeType === Node.ELEMENT_NODE || n.nodeType === Node.TEXT_NODE) {
            if (n instanceof Element && (n.classList.contains("cc-ext-tooltip") || n.classList.contains("cc-ext-converted") || n.classList.contains("cc-ext-price-wrapper")))
              continue;
            r.add(n);
          }
      for (const t of r) {
        const n = t.nodeType === Node.TEXT_NODE ? t.parentElement : t;
        n && O(n);
      }
    }, 300);
  }), C.observe(document.body, {
    childList: !0,
    subtree: !0
  });
}
chrome.storage.onChanged.addListener((e, r) => {
  if (r === "sync" && e.settings) {
    const t = e.settings.newValue, n = !f || t.displayMode !== f.displayMode || t.targetCurrencies.join(",") !== f.targetCurrencies.join(",") || t.dollarDefault !== f.dollarDefault;
    f = t, n && (te(), O(document.body));
  }
});
ne().catch((e) => {
  console.error("[CurrencyConverter] Init failed:", e);
});
