# 🔑 API Keys Setup Guide

## Get These API Keys (Quick & Easy!)

### 1. Brave Search API (FREE - Recommended)
**Why:** For actual web search (like Google but free!)
**Cost:** FREE 2,000 searches/month
**Time:** 2 minutes

**Steps:**
1. Go to: https://brave.com/search/api/
2. Click "Get Started"
3. Sign up with email
4. Create an API key
5. Copy the key

**Add to `.env.local`:**
```env
BRAVE_API_KEY=BSA1a2b3c4d5e6f7g8h9...
```

---

### 2. OpenAI API (For AI parsing)
**Why:** To intelligently extract product info from search results
**Cost:** Pay-as-you-go (~$0.01 per search, $5 free credit)
**Time:** 3 minutes

**Steps:**
1. Go to: https://platform.openai.com/api-keys
2. Sign up / Log in
3. Click "Create new secret key"
4. Name it "Comparos"
5. Copy the key (starts with `sk-...`)

**Add to `.env.local`:**
```env
OPENAI_API_KEY=sk-proj-abc123...
```

---

## Quick Setup (5 minutes total)

1. **Copy the example file:**
```bash
cp .env.local.example .env.local
```

2. **Edit `.env.local` and add your keys:**
```env
# Brave Search (get from brave.com/search/api)
BRAVE_API_KEY=your_brave_key_here

# OpenAI (get from platform.openai.com/api-keys)
OPENAI_API_KEY=sk-your_key_here
```

3. **Restart the dev server:**
```bash
npm run dev
```

4. **That's it!** Now search for any product and get REAL prices!

---

## Alternative Options (If you prefer)

### SerpAPI (Instead of Brave)
- FREE 100 searches/month
- Get at: https://serpapi.com/
- Add to `.env.local`: `SERP_API_KEY=your_key`

### Anthropic Claude (Instead of OpenAI)
- Similar to OpenAI
- Get at: https://console.anthropic.com/
- Add to `.env.local`: `ANTHROPIC_API_KEY=your_key`

---

## Cost Breakdown

### Development (Testing):
- **Brave Search**: FREE (2,000/month)
- **OpenAI**: FREE ($5 credit = ~500 searches)
- **Total**: $0

### Production (Real users):
- **Brave Search**: FREE or $5/month for 20,000
- **OpenAI**: ~$0.01 per search
- **Example**: 1,000 searches = ~$10/month

---

## Test It Works

After adding your API keys:

```bash
# Start dev server
npm run dev

# Search for something
"Oral-B toothbrush"
"iPhone 15"
"Sony headphones"
```

**You should see:**
- Real search results in console logs
- Actual prices from stores
- Real product information

**Console output will show:**
```
🔍 Searching for: toothbrush
🌐 Web searching: toothbrush buy price
💰 Searching prices for: Toothbrush
✅ Found product: Oral-B Electric Toothbrush at $49.99
```

---

## Troubleshooting

### "API key not working"
- Make sure you copied the entire key
- Check file is named `.env.local` (not `.env.local.txt`)
- Restart dev server after adding keys

### "Still showing fallback prices"
- API keys might not be set
- Check console for error messages
- Verify keys are correct

### "Images not showing"
- This is normal without Bing Image Search API
- Will use category placeholders
- Add Bing key for real images (optional)

---

## What Will Work With Just These 2 Keys

✅ **Real web search** (Brave Search)
✅ **Actual price extraction** (from search results)
✅ **Intelligent product parsing** (OpenAI)
✅ **Multi-store comparison** (Amazon, Walmart, Target, Best Buy)
✅ **Category-based images** (placeholders that work)

---

## Ready to Go!

1. Get Brave Search API key (2 min)
2. Get OpenAI API key (3 min)
3. Add to `.env.local`
4. `npm run dev`
5. Search for anything!

**That's it! Comparos will now search the real web and get actual prices!**
