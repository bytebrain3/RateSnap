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

const PROCESSED_ATTR = "data-cc-processed";

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
      // Skip already-processed nodes
      if (parent.hasAttribute(PROCESSED_ATTR)) return NodeFilter.FILTER_REJECT;
      // Skip our own tooltip/display elements
      if (parent.closest(".cc-ext-tooltip, .cc-ext-converted")) {
        return NodeFilter.FILTER_REJECT;
      }
      // Skip invisible elements
      if (parent.offsetParent === null && parent.tagName !== "BODY") {
        return NodeFilter.FILTER_REJECT;
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

export { PROCESSED_ATTR };
