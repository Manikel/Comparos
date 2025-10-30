import * as cheerio from "cheerio";

export async function fetchHtml(url: string, timeoutMs = 8000): Promise<string | null> {
  try {
    const ctl = new AbortController();
    const id = setTimeout(() => ctl.abort(), timeoutMs);

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
      },
      signal: ctl.signal,
    });
    clearTimeout(id);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

export function firstMatchPrice($: cheerio.CheerioAPI): number | null {
  // Try common price patterns in order
  const candidates: string[] = [];

  // aria labels / meta
  const aria = $('*[aria-label*="$"], *[aria-label*="USD"]').first().attr("aria-label");
  if (aria) candidates.push(aria);

  // microdata / JSON-ish content
  const metaContent = $('meta[itemprop="price"]').attr("content");
  if (metaContent) candidates.push(metaContent);

  // common classes
  candidates.push(
    $(".a-price-whole").first().text() + "." + ($(".a-price-fraction").first().text() || "00"), // Amazon
    $('[class*="priceView-hero-price"]').first().text(), // Best Buy
    $('[data-testid="product-price"]').first().text(), // Walmart
    $('[data-automation-id="productPrice"]').first().text(), // Sony
    $('[data-selenium="pricingPrice"]').first().text(), // B&H
    $(".price, .Price, .product-price, .price__value").first().text()
  );

  // fallback: scan entire page for $xxx.xx
  const body = $("body").text();
  candidates.push(body);

  for (const raw of candidates) {
    if (!raw) continue;
    const match = String(raw).replace(/\s+/g, " ").match(/\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
    if (match) {
      const n = parseFloat(match[1].replace(/,/g, ""));
      if (Number.isFinite(n) && n > 0 && n < 20000) return n;
    }
  }
  return null;
}

export function absolutizeUrl(base: string, href?: string): string | null {
  if (!href) return null;
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}