# Quick Setup Guide

## Development Setup

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## How to Use

### Step 1: Search for Products
- The screen is split in half
- Left side: Enter your first product (e.g., "Oral-B Electric Toothbrush")
- Right side: Enter your second product (e.g., "Colgate Electric Toothbrush")
- You can enter: product names, brands, or direct URLs

### Step 2: Confirm Products
- After searching, you'll see the found product with its image
- Click "✓ This is correct" if it's the right product
- Click "✗ Try again" to search again
- After 2 denials, you'll be asked to enter the URL directly

### Step 3: Compare
- Once both products are confirmed (showing "Locked In"), click the "Compare Products" button
- Wait while the app analyzes specs, reviews, and ratings

### Step 4: Review Results
- Scroll through the side-by-side comparison
- Check which product wins in each category (arrows show the winner)
- Read the reviews summary
- See the final conclusion at the bottom

### Step 5: Start Over
- Click "Compare Different Items" to reset and compare new products

## Mock Data Notice

**Important**: This is currently an MVP with mock data.

The app generates realistic-looking but fake:
- Product specifications
- Review scores
- Pricing information
- Comparison results

For production use, you'll need to integrate:
- Real product APIs (Amazon, BestBuy, etc.)
- Web scraping for stores without APIs
- AI services (OpenAI GPT-4 or Anthropic Claude) for intelligent analysis
- Real review aggregation

## Customization Tips

### Change Colors
Edit `tailwind.config.ts` to customize the color palette

### Adjust Comparison Metrics
Edit `app/api/compare/route.ts` to add/remove comparison categories

### Modify Search Logic
Edit `app/api/search/route.ts` to customize product search behavior

## Building for Production

```bash
# Build the production bundle
npm run build

# Start production server
npm start
```

## Troubleshooting

### Port 3000 already in use
```bash
# Kill the process on port 3000
npx kill-port 3000

# Or run on a different port
PORT=3001 npm run dev
```

### Dependencies issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

## Next Steps for Production

1. **Set up API keys** (copy `.env.local.example` to `.env.local`)
2. **Integrate real APIs**:
   - Amazon Product Advertising API
   - Best Buy Developer API
   - Web scraping setup (Puppeteer/Cheerio)
3. **Add AI service**:
   - OpenAI for GPT-4
   - Anthropic for Claude
4. **Set up caching** (Redis recommended)
5. **Deploy to hosting**:
   - Vercel (recommended for Next.js)
   - Netlify
   - AWS/GCP/Azure
6. **Register domain**: comparos.app
7. **Configure DNS** to point to your deployment

---

**Happy comparing! 🚀**
