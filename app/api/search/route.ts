import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import * as cheerio from "cheerio";

/* ------------------------------ HTTP helpers ------------------------------ */

async function fetchHtml(url: string, timeoutMs = 30000): Promise<string | null> {
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), timeoutMs);

    // Use ScraperAPI if available (bypasses anti-bot measures)
    let fetchUrl = url;
    const headers: Record<string, string> = {};

    if (process.env.SCRAPER_API_KEY) {
      // ScraperAPI: proxy through their service
      fetchUrl = `http://api.scraperapi.com?api_key=${process.env.SCRAPER_API_KEY}&url=${encodeURIComponent(url)}&render=false`;
      console.log(`🔧 Using ScraperAPI for: ${new URL(url).hostname}`);
    } else {
      // Direct fetch (will likely be blocked by Amazon, etc.)
      console.warn(`⚠️ No SCRAPER_API_KEY - using direct fetch (may be blocked)`);
      headers["User-Agent"] =
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
      headers["Accept"] = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8";
      headers["Accept-Language"] = "en-US,en;q=0.9";
      headers["Cache-Control"] = "no-cache";
      headers["Referer"] = "https://www.google.com/";
    }

    const res = await fetch(fetchUrl, {
      headers,
      signal: ctl.signal,
    });
    clearTimeout(t);

    console.log(`📡 Fetch response from ${new URL(url).hostname}: ${res.status} ${res.statusText}`);

    if (!res.ok) {
      console.warn(`❌ Bad response: ${res.status} for ${url}`);
      return null;
    }

    const html = await res.text();
    console.log(`✅ Successfully fetched ${html.length} bytes`);
    return html;
  } catch (err) {
    console.error(`❌ Fetch error for ${url}:`, err instanceof Error ? err.message : String(err));
    return null;
  }
}

/* ---------------------------- Search (Brave API) --------------------------- */

async function searchProductUrls(query: string, domains: string[]): Promise<string[]> {
  const links: string[] = [];

  if (!process.env.BRAVE_API_KEY) {
    console.error("❌ BRAVE_API_KEY not set - cannot search");
    return [];
  }

  for (const domain of domains) {
    const q = `site:${domain} ${query}`;

    try {
      const response = await fetch(
        `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(q)}&count=10`,
        {
          headers: {
            "Accept": "application/json",
            "Accept-Encoding": "gzip",
            "X-Subscription-Token": process.env.BRAVE_API_KEY,
          },
        }
      );

      if (!response.ok) {
        console.error(`Brave API error for ${domain}:`, response.status);
        continue;
      }

      const data = await response.json();

      // Extract URLs from results
      if (data.web?.results) {
        for (const result of data.web.results) {
          if (result.url && result.url.includes(domain)) {
            links.push(result.url);
          }
        }
      }
    } catch (error) {
      console.error(`Error searching ${domain}:`, error);
      continue;
    }

    // Rate limit: small delay between requests
    await new Promise((r) => setTimeout(r, 200));
  }

  // de-dup + keep order
  const seen = new Set<string>();
  const unique = links.filter((u) => (seen.has(u) ? false : (seen.add(u), true)));

  return unique;
}

/* ------------------------------- Extraction -------------------------------- */

function og($: cheerio.CheerioAPI, prop: string) {
  return $(`meta[property="og:${prop}"]`).attr("content") || "";
}

function firstPrice($: cheerio.CheerioAPI): number | null {
  const candidates: string[] = [];

  // common price locations
  const aria = $('*[aria-label*="$"], *[aria-label*="USD"]').first().attr("aria-label");
  if (aria) candidates.push(aria);

  const metaPrice = $('meta[itemprop="price"]').attr("content");
  if (metaPrice) candidates.push(metaPrice);

  candidates.push(
    // Amazon-like
    ($(".a-price-whole").first().text() || "") + "." + ($(".a-price-fraction").first().text() || "00"),
    // BestBuy
    $('[class*="priceView-hero-price"]').first().text(),
    // Walmart
    $('[data-testid="product-price"]').first().text(),
    // Generic patterns
    $(".price, .Price, .product-price, .price__value").first().text()
  );

  // Entire body as last resort (regex scan)
  candidates.push($("body").text());

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

type Extracted = { title?: string; image?: string; price?: number | null };

function extractGeneric(html: string): Extracted {
  const $ = cheerio.load(html);
  return {
    title:
      og($, "title") ||
      $("h1").first().text().trim() ||
      $('meta[name="title"]').attr("content") ||
      $("title").first().text().trim(),
    image: og($, "image") || $('img[alt][src]').first().attr("src"),
    price: firstPrice($),
  };
}

function extractAmazon(html: string): Extracted {
  const $ = cheerio.load(html);

  console.log('🔍 Amazon extraction starting...');

  const title =
    $("#productTitle").text().trim() ||
    og($, "title") ||
    $("title").first().text().trim();

  console.log(`  - Title: "${title?.substring(0, 60)}..." (length: ${title?.length || 0})`);

  const img =
    $("#landingImage").attr("src") ||
    $('img#imgBlkFront').attr("src") ||
    og($, "image") ||
    $('img[alt][src]').first().attr("src");

  console.log(`  - Image: ${img ? 'Found (' + img.substring(0, 60) + '...)' : 'Not found'}`);

  const price = firstPrice($);
  console.log(`  - Price: ${price || 'Not found'}`);

  // Check for bot detection
  if (html.includes('captcha') || html.includes('robot') || html.toLowerCase().includes('sorry')) {
    console.warn('⚠️ Possible CAPTCHA or bot detection page!');
    console.log('  HTML snippet:', html.substring(0, 500));
  }

  return { title, image: img, price };
}

function extractBestBuy(html: string): Extracted {
  const $ = cheerio.load(html);
  const title =
    $('[data-automation="product-title"]').first().text().trim() ||
    $("h1.sku-title").first().text().trim() ||
    og($, "title") ||
    $("title").first().text().trim();
  const img =
    $('img.primary-image').attr("src") ||
    $('img[src*="bbystatic"]').first().attr("src") ||
    og($, "image") ||
    $('img[alt][src]').first().attr("src");
  const price = firstPrice($);
  return { title, image: img, price };
}

function extractWalmart(html: string): Extracted {
  const $ = cheerio.load(html);
  const title =
    $('[itemprop="name"]').first().text().trim() ||
    $("h1").first().text().trim() ||
    og($, "title") ||
    $("title").first().text().trim();
  const img = og($, "image") || $('img[alt][src]').first().attr("src");
  const price = firstPrice($);
  return { title, image: img, price };
}

function pickExtractor(hostname: string) {
  const h = hostname.toLowerCase();
  if (h.includes("amazon.")) return extractAmazon;
  if (h.includes("bestbuy.")) return extractBestBuy;
  if (h.includes("walmart.")) return extractWalmart;
  return extractGeneric;
}

/* ------------------------------- Sanitizers -------------------------------- */

function isBadPage(html: string, title?: string): boolean {
  const bad = /support|help|customer\-service|community|search\sresults|blog|news|store\/apps?|appstore|play\.google/i;

  if (title && bad.test(title)) {
    console.log(`  ⚠️ Bad page detected in title: "${title}"`);
    return true;
  }

  // Only check a small portion of HTML to avoid false positives
  const htmlSnippet = html.substring(0, 2000);
  if (bad.test(htmlSnippet)) {
    console.log(`  ⚠️ Bad page detected in HTML (support/help/search page)`);
    return true;
  }

  return false;
}

/* --------------------------------- OpenAI ---------------------------------- */

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

type Expansion = { fullName?: string; brand?: string; model?: string; category?: string };

async function expandQueryWithAI(rawQuery: string): Promise<Expansion> {
  try {
    const exp = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: "Expand vague product input into a clean product name. Return JSON only." },
        { role: "user", content: `Input: ${rawQuery}\nReturn JSON with {fullName, brand, model, category}.` },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });
    const raw = exp.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw) as Expansion;
    return parsed;
  } catch {
    return {};
  }
}

/* --------------------------------- Handler --------------------------------- */

export async function POST(req: NextRequest) {
  try {
    const { query, isUrl }: { query: string; isUrl?: boolean } = await req.json();

    console.log('🔍 Search request:', { query, isUrl });

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "missing_query" }, { status: 400 });
    }

    // Check API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY not set');
      return NextResponse.json(
        { error: "api_key_missing", message: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    if (!process.env.BRAVE_API_KEY) {
      console.error('❌ BRAVE_API_KEY not set');
      return NextResponse.json(
        { error: "api_key_missing", message: "Brave API key not configured" },
        { status: 500 }
      );
    }

    if (!process.env.SCRAPER_API_KEY) {
      console.warn('⚠️ SCRAPER_API_KEY not set - scraping may fail due to anti-bot measures');
    }

    // 1) AI expansion (xm4 -> Sony WH-1000XM4)
    console.log('🤖 Expanding query with AI...');
    const expansion = await expandQueryWithAI(query);
    console.log('✅ Expansion result:', expansion);

    const expandedName =
      expansion.fullName ||
      [expansion.brand, expansion.model].filter(Boolean).join(" ") ||
      query;

    console.log('📝 Final search query:', expandedName);

    // 2) Build candidate URLs (search engine first), or accept direct URL
    const domains = [
      "amazon.com",
      "bestbuy.com",
      "walmart.com",
      "target.com",
      "bhphotovideo.com",
      "adorama.com",
      "sony.com",
      "electronics.sony.com",
    ];

    console.log('🔎 Searching domains:', domains.slice(0, 3), '...');
    const candidateUrls = isUrl ? [query] : await searchProductUrls(expandedName, domains);
    console.log(`📋 Found ${candidateUrls.length} candidate URLs:`, candidateUrls.slice(0, 3));

    if (candidateUrls.length === 0) {
      console.warn('⚠️ No candidate URLs found');
      return NextResponse.json(
        {
          error: "no_results",
          message: "No product pages found. Try a different search term or paste a direct link.",
          debug: {
            query: query,
            expandedQuery: expandedName,
            expansion: expansion,
            searchedDomains: domains
          }
        },
        { status: 404 }
      );
    }

    // 3) Visit candidates and extract data
    const results: Array<{ store: string; url: string; title?: string; image?: string; price?: number | null }> = [];

    for (const productUrl of candidateUrls.slice(0, 5)) {
      let host = "";
      try {
        host = new URL(productUrl).hostname;
      } catch {
        console.warn('⚠️ Invalid URL:', productUrl);
        continue;
      }

      console.log(`🌐 Fetching: ${host} - ${productUrl}`);
      // Longer timeout for ScraperAPI (they handle retries internally)
      const html = await fetchHtml(productUrl, 30000);

      if (!html) {
        console.warn(`⚠️ Failed to fetch HTML from: ${productUrl}`);
        continue;
      }

      console.log(`✅ Fetched ${html.length} bytes of HTML from ${host}`);

      const extractor = pickExtractor(host);
      const data = extractor(html);

      console.log(`📊 Extracted from ${host}:`, {
        title: data.title?.substring(0, 50),
        titleLength: data.title?.length || 0,
        hasImage: !!data.image,
        imageUrl: data.image?.substring(0, 80),
        price: data.price,
        htmlSnippet: html.substring(0, 200).replace(/\s+/g, ' ')
      });

      // skip obviously non-PDP pages
      if (isBadPage(html, data.title)) {
        console.warn(`⚠️ Skipping bad page: ${productUrl}`);
        continue;
      }

      results.push({
        store: host,
        url: productUrl,
        title: (data.title || expandedName)?.trim(),
        image: data.image,
        price: data.price ?? null,
      });

      // Small delay between requests (ScraperAPI handles rate limiting)
      await new Promise((r) => setTimeout(r, 200));
    }

    console.log(`✅ Successfully extracted ${results.length} results`);

    // 4) Pick primary (cheapest if we have prices, else first)
    const priced = results.filter((r) => r.price != null) as Array<(typeof results)[number] & { price: number }>;
    const primary = priced.length ? priced.sort((a, b) => a.price - b.price)[0] : results[0];

    if (!primary) {
      console.error('❌ No valid product found after extraction');
      return NextResponse.json(
        {
          error: "no_product_found",
          message: "Could not extract product data from found pages. Try a more specific name or paste a direct link.",
          debug: {
            query: query,
            expandedQuery: expandedName,
            candidateUrlsFound: candidateUrls.length,
            urlsTried: candidateUrls.slice(0, 5),
            resultsExtracted: results.length,
            extractedData: results.map(r => ({
              store: r.store,
              hasTitle: !!r.title,
              hasPrice: !!r.price,
              hasImage: !!r.image
            }))
          }
        },
        { status: 404 }
      );
    }

    console.log('🎯 Primary product selected:', { store: primary.store, price: primary.price });

    // 5) Build UI product object - ONLY real data, no fallbacks
    const product = {
      id: "scraped-" + Date.now(),
      name: primary.title || expandedName,
      brand: expansion.brand,
      model: expansion.model,
      image: primary.image, // No fallback - undefined if not found
      price: primary.price != null ? `$${primary.price.toFixed(2)}` : undefined,
      cheapestPrice: primary.price ?? undefined,
      cheapestStore: primary.store,
      url: primary.url,
      storePrices: results
        .filter((r) => r.price != null)
        .map((r) => ({ store: r.store, price: r.price as number, url: r.url })),
      source: "scrape",
    };

    console.log('✅ Search successful!');
    return NextResponse.json({ product, debug: { expansion, tried: results.map((r) => r.url) } });
  } catch (e) {
    console.error("[/api/search] error", e);
    return NextResponse.json({ error: "search_failed", message: String(e) }, { status: 500 });
  }
}
