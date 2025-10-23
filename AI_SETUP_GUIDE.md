# 🤖 AI-Powered Comparos Setup Guide

Comparos uses AI and web search to find **REAL-TIME prices** and **actual product images** from the web. This guide will help you set it up.

## 🚀 Quick Start (5 minutes)

### Step 1: Get Free API Keys

#### Option A: Brave Search (Recommended - FREE)
1. Go to https://brave.com/search/api/
2. Sign up for a free account
3. Get your API key (2,000 free searches/month)
4. Add to `.env.local`: `BRAVE_API_KEY=your_key_here`

#### Option B: SerpAPI (Alternative - FREE)
1. Go to https://serpapi.com/
2. Sign up (2,500 free searches/month)
3. Get your API key
4. Add to `.env.local`: `SERP_API_KEY=your_key_here`

### Step 2: Get AI API (For Smart Parsing)

#### OpenAI (Recommended)
1. Go to https://platform.openai.com/api-keys
2. Create an API key
3. Add to `.env.local`: `OPENAI_API_KEY=your_key_here`
4. Cost: ~$0.01 per comparison (very cheap!)

#### Anthropic Claude (Alternative)
1. Go to https://console.anthropic.com/
2. Create an API key
3. Add to `.env.local`: `ANTHROPIC_API_KEY=your_key_here`

### Step 3: Start the App

```bash
# Copy environment file
cp .env.local.example .env.local

# Edit .env.local and add your API keys

# Install dependencies (if not done)
npm install

# Start development server
npm run dev
```

Visit http://localhost:3000 and search for ANY product!

---

## 🔥 How It Works

### 1. Web Search
When you search for "Oral-B toothbrush", Comparos:
- Uses Brave/SerpAPI to search the web
- Finds product listings from Amazon, Best Buy, Target, Walmart
- Extracts real prices from search results

### 2. AI Parsing
The AI (GPT-4/Claude):
- Reads search results
- Identifies the exact product
- Extracts specifications
- Finds the best product images
- Compares features intelligently

### 3. Price Extraction
For each store:
- Searches: "Oral-B toothbrush price site:amazon.com"
- Extracts prices using regex and AI
- Returns cheapest price across all stores

### 4. Image Finding
- Searches for product images
- Validates image URLs
- Falls back to category placeholders if needed

---

## 💰 Cost Breakdown

### Free Tier (Perfect for Development)
- **Brave Search**: 2,000 searches/month FREE
- **SerpAPI**: 2,500 searches/month FREE
- **OpenAI**: ~$5 free credit (500 comparisons)
- **Total**: Completely FREE for testing!

### Production Costs (Very Low)
- **Search**: $0-$5/month (free tiers cover most usage)
- **AI**: ~$0.01 per comparison
- **1,000 comparisons/month**: ~$10

---

## 🎯 What Can You Compare?

### ✅ Physical Products
- Electronics (phones, laptops, headphones)
- Home goods (toothbrushes, appliances)
- Cars and vehicles
- Clothing and shoes
- Cameras and photography gear

### ✅ Digital Products
- Software (Windows vs macOS)
- Mobile apps
- Subscriptions
- Cloud services

### ✅ Services
- Streaming platforms (Netflix vs Hulu)
- Internet plans
- Phone plans

### ✅ Anything Else!
- The AI can compare ANYTHING with available web data

---

## 🔧 Advanced Setup

### Using Real Web Scraping

For even more accurate data, add web scraping:

```bash
npm install puppeteer cheerio
```

Then update `app/api/search/route.ts` to actually scrape product pages.

### Using Multiple AI Providers

For redundancy, set up both OpenAI and Anthropic:

```env
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
```

The system will fall back if one fails.

### Caching Results

To save API costs, add Redis caching:

```bash
npm install redis
```

```env
REDIS_URL=your_redis_url
```

---

## 🐛 Troubleshooting

### "Images not loading"
- Check if placeholder service is blocked
- Verify image URLs in console
- Enable CORS if needed

### "Prices seem random"
- API key not set (using fallback prices)
- Check `.env.local` file exists
- Verify API key is valid
- Check console for errors

### "Search not working"
- Verify API keys in `.env.local`
- Check API rate limits
- Look at console logs for errors

---

## 📊 API Status Check

Test your APIs:

```bash
# Test Brave Search
curl -H "X-Subscription-Token: YOUR_KEY" \
  "https://api.search.brave.com/res/v1/web/search?q=test"

# Test OpenAI
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_KEY"
```

---

## 🎓 Next Steps

1. **Get API Keys** (5 minutes)
2. **Test with a few products** (2 minutes)
3. **Deploy to Vercel** (free!)
4. **Register comparos.app domain**
5. **Launch! 🚀**

---

## 💡 Pro Tips

- **Start with free tiers** - They're plenty for testing
- **Monitor API usage** - Check dashboards regularly
- **Cache results** - Save money on repeated searches
- **Use webhooks** - Get notified of price changes

---

## 🤝 Need Help?

- Check the console for detailed logs
- API key issues? Verify in `.env.local`
- Rate limited? Wait or upgrade tier
- Still stuck? Check the README.md

---

**Built with ❤️ using AI-powered web search**
