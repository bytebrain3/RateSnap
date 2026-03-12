import type { DetectedPrice, ConvertedPrice, DisplayMode } from "../lib/types";
import { convertToMultiple } from "./converter";
import { PROCESSED_ATTR } from "./priceDetector";

const TOOLTIP_CLASS = "cc-ext-tooltip";
const CONVERTED_CLASS = "cc-ext-converted";
const WRAPPER_CLASS = "cc-ext-price-wrapper";
const ORIGINAL_ATTR = "data-cc-original";
const CURRENCY_ATTR = "data-cc-currency";

export function displayConversions(
  prices: DetectedPrice[],
  targetCurrencies: string[],
  rates: Record<string, number>,
  base: string,
  mode: DisplayMode,
): void {
  // ── Element-level prices (container scan) ─────────────────────────────
  // These are prices spread across multiple child DOM nodes; we attach the
  // tooltip/badge directly to the container element.
  for (const price of prices) {
    if (!price.element) continue;
    const el = price.element;
    if (el.hasAttribute(PROCESSED_ATTR)) continue;

    const converted = convertToMultiple(
      price.amount,
      price.currency,
      targetCurrencies,
      rates,
      base,
    );
    if (!converted.length) continue;

    el.setAttribute(PROCESSED_ATTR, "true");

    if (mode === "tooltip") {
      el.classList.add("cc-ext-has-tooltip");
      // Ensure a stacking context so the absolute tooltip is positioned correctly
      if (window.getComputedStyle(el).position === "static") {
        (el as HTMLElement).style.position = "relative";
      }
      const tooltip = document.createElement("span");
      tooltip.className = TOOLTIP_CLASS;
      tooltip.innerHTML = converted
        .map(
          (c) =>
            `<span class="cc-ext-tooltip-row">` +
            `<span class="cc-ext-tooltip-currency">${c.targetCurrency}</span>` +
            `<span class="cc-ext-tooltip-amount">${c.formatted}</span>` +
            `</span>`,
        )
        .join("");
      el.appendChild(tooltip);
    } else {
      // Replacement mode: insert a badge immediately after the container
      const badge = document.createElement("span");
      badge.className = `${WRAPPER_CLASS} cc-ext-el-badge`;
      badge.setAttribute(ORIGINAL_ATTR, price.originalText);
      badge.setAttribute(CURRENCY_ATTR, price.currency);
      badge.textContent = " → " + converted.map((c) => c.formatted).join(" / ");
      el.insertAdjacentElement("afterend", badge);
    }
  }

  // ── Text-node level prices ─────────────────────────────────────────────
  // Group by text node (process from end to start to preserve offsets)
  const byNode = new Map<Text, DetectedPrice[]>();
  for (const price of prices) {
    if (!price.node) continue; // skip element-level
    const list = byNode.get(price.node) || [];
    list.push(price);
    byNode.set(price.node, list);
  }

  for (const [textNode, nodePrices] of byNode) {
    // Sort by offset descending so we can splice from end to start
    const sorted = [...nodePrices].sort(
      (a, b) => b.startOffset - a.startOffset,
    );

    const parent = textNode.parentElement;
    if (!parent) continue;

    const text = textNode.textContent || "";

    // Build replacement fragments from end to start
    const fragment = document.createDocumentFragment();
    let lastIdx = text.length;

    for (const price of sorted) {
      const converted = convertToMultiple(
        price.amount,
        price.currency,
        targetCurrencies,
        rates,
        base,
      );

      if (converted.length === 0) continue;

      // Text after this price
      if (price.endOffset < lastIdx) {
        fragment.prepend(
          document.createTextNode(text.slice(price.endOffset, lastIdx)),
        );
      }

      // Create the price wrapper
      const wrapper = createPriceElement(
        price.originalText,
        price.currency,
        converted,
        mode,
      );
      fragment.prepend(wrapper);

      lastIdx = price.startOffset;
    }

    // Text before all prices
    if (lastIdx > 0) {
      fragment.prepend(document.createTextNode(text.slice(0, lastIdx)));
    }

    parent.setAttribute(PROCESSED_ATTR, "true");
    parent.replaceChild(fragment, textNode);
  }
}

function createPriceElement(
  originalText: string,
  originalCurrency: string,
  converted: ConvertedPrice[],
  mode: DisplayMode,
): HTMLElement {
  const wrapper = document.createElement("span");
  wrapper.className = WRAPPER_CLASS;
  wrapper.setAttribute(ORIGINAL_ATTR, originalText);
  wrapper.setAttribute(CURRENCY_ATTR, originalCurrency);

  if (mode === "tooltip") {
    // Show original with tooltip on hover
    wrapper.textContent = originalText;
    wrapper.classList.add("cc-ext-has-tooltip");

    const tooltip = document.createElement("span");
    tooltip.className = TOOLTIP_CLASS;
    tooltip.innerHTML = converted
      .map(
        (c) =>
          `<span class="cc-ext-tooltip-row">` +
          `<span class="cc-ext-tooltip-currency">${c.targetCurrency}</span>` +
          `<span class="cc-ext-tooltip-amount">${c.formatted}</span>` +
          `</span>`,
      )
      .join("");
    wrapper.appendChild(tooltip);
  } else {
    // Replacement mode: show converted prices
    const convertedText = converted.map((c) => c.formatted).join(" / ");
    wrapper.classList.add(CONVERTED_CLASS);
    wrapper.textContent = convertedText;

    // Add a small badge to show original on hover
    const badge = document.createElement("span");
    badge.className = "cc-ext-original-badge";
    badge.textContent = `(${originalText})`;
    wrapper.appendChild(badge);
  }

  return wrapper;
}

export function clearConversions(root: Element = document.body): void {
  // Remove element-level tooltip spans (appended as children)
  root.querySelectorAll(".cc-ext-has-tooltip").forEach((el) => {
    el.querySelector(`.${TOOLTIP_CLASS}`)?.remove();
    el.classList.remove("cc-ext-has-tooltip");
    (el as HTMLElement).style.position = "";
  });

  // Remove element-level replacement badges (inserted after the container)
  root.querySelectorAll(".cc-ext-el-badge").forEach((el) => el.remove());

  // Restore text-node level conversions
  const wrappers = root.querySelectorAll(
    `.${WRAPPER_CLASS}:not(.cc-ext-el-badge)`,
  );
  wrappers.forEach((wrapper) => {
    const original = wrapper.getAttribute(ORIGINAL_ATTR);
    if (original) {
      const textNode = document.createTextNode(original);
      wrapper.parentNode?.replaceChild(textNode, wrapper);
    }
  });

  // Remove processed markers
  const processed = root.querySelectorAll(`[${PROCESSED_ATTR}]`);
  processed.forEach((el) => el.removeAttribute(PROCESSED_ATTR));
}
