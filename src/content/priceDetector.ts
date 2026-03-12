import type { DetectedPrice } from "../lib/types";
import {
  PRICE_REGEX,
  parseAmount,
  resolveSymbolToCode,
  CODE_SET,
} from "./currencyMap";

// Elements to skip when walking the DOM
const SKIP_TAGS = new Set([
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
  "PRE",
]);

// CSS selectors for elements likely to contain prices that are split across nodes
// (e.g. Amazon's <span class="a-price-symbol">$</span><span>151</span>)
const PRICE_CONTAINER_SELECTORS = [
  '[class*="price"]',
  '[itemprop="price"]',
  "[data-price]",
  '[class*="amount"]',
  '[class*="cost"]',
].join(",");

export const PROCESSED_ATTR = "data-cc-processed";

export function detectPrices(
  root: Node,
  dollarDefault: string,
): DetectedPrice[] {
  const prices: DetectedPrice[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node: Text) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
      // Skip already-processed nodes (and those inside a processed container)
      if (
        parent.hasAttribute(PROCESSED_ATTR) ||
        parent.closest(`[${PROCESSED_ATTR}]`)
      ) {
        return NodeFilter.FILTER_REJECT;
      }
      // Skip our own tooltip/display elements
      if (parent.closest(".cc-ext-tooltip, .cc-ext-converted")) {
        return NodeFilter.FILTER_REJECT;
      }
      // Skip invisible elements — but allow position:fixed/sticky (sticky price bars)
      if (parent.offsetParent === null && parent.tagName !== "BODY") {
        const pos = window.getComputedStyle(parent).position;
        if (pos !== "fixed" && pos !== "sticky") {
          return NodeFilter.FILTER_REJECT;
        }
      }
      const text = node.textContent || "";
      if (text.trim().length < 2) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let textNode: Text | null;
  while ((textNode = walker.nextNode() as Text | null)) {
    const text = textNode.textContent || "";
    const regex = new RegExp(PRICE_REGEX.source, PRICE_REGEX.flags);
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const groups = match.groups!;
      let currency: string;
      let amountStr: string;

      if (groups.prefixSymbol && groups.prefixNum) {
        currency = resolveSymbolToCode(groups.prefixSymbol, dollarDefault);
        amountStr = groups.prefixNum;
      } else if (groups.prefixCode && groups.prefixCodeNum) {
        currency = groups.prefixCode;
        amountStr = groups.prefixCodeNum;
      } else if (groups.suffixNum && groups.suffixCode) {
        currency = groups.suffixCode;
        amountStr = groups.suffixNum;
      } else {
        continue;
      }

      if (!CODE_SET.has(currency)) continue;

      const amount = parseAmount(amountStr);
      if (isNaN(amount) || amount <= 0 || amount > 999_999_999_999) continue;

      prices.push({
        node: textNode,
        currency,
        amount,
        originalText: match[0],
        startOffset: match.index,
        endOffset: match.index + match[0].length,
      });
    }
  }

  return prices;
}

/**
 * Secondary scan: finds price elements whose text is split across child DOM
 * nodes (e.g. Amazon's `<span>$</span><span>151</span><span>94</span>`).
 * Must be run BEFORE detectPrices so it can claim containers first, preventing
 * the text-node walker from wastefully processing hidden offscreen spans inside
 * them.
 */
export function detectPricesInContainers(
  root: Node,
  dollarDefault: string,
): DetectedPrice[] {
  if (!(root instanceof Element)) return [];
  const prices: DetectedPrice[] = [];

  const candidates = root.querySelectorAll<Element>(PRICE_CONTAINER_SELECTORS);

  for (const el of candidates) {
    // Skip if we or any descendant is already processed
    if (el.hasAttribute(PROCESSED_ATTR)) continue;
    if (el.querySelector(`[${PROCESSED_ATTR}]`)) continue;
    if (el.closest(".cc-ext-tooltip, .cc-ext-converted, .cc-ext-price-wrapper"))
      continue;

    // Normalise whitespace so "$" and "151.94" from siblings join correctly
    const text = (el.textContent || "").replace(/\s+/g, " ").trim();
    if (!text || text.length < 2 || text.length > 80) continue;

    const regex = new RegExp(PRICE_REGEX.source, PRICE_REGEX.flags);
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const groups = match.groups!;
      let currency = "";
      let amountStr = "";

      if (groups.prefixSymbol && groups.prefixNum) {
        currency = resolveSymbolToCode(groups.prefixSymbol, dollarDefault);
        amountStr = groups.prefixNum;
      } else if (groups.prefixCode && groups.prefixCodeNum) {
        currency = groups.prefixCode;
        amountStr = groups.prefixCodeNum;
      } else if (groups.suffixNum && groups.suffixCode) {
        currency = groups.suffixCode;
        amountStr = groups.suffixNum;
      } else continue;

      if (!CODE_SET.has(currency)) continue;

      const amount = parseAmount(amountStr);
      if (isNaN(amount) || amount <= 0 || amount > 999_999_999_999) continue;

      prices.push({
        node: null,
        element: el,
        currency,
        amount,
        originalText: match[0],
        startOffset: match.index,
        endOffset: match.index + match[0].length,
      });
      break; // one price per container to avoid false positives
    }
  }

  return prices;
}
