# Comparos

**Smart Product Comparison Made Simple**

Comparos is a modern web application that helps you compare two products side-by-side with intelligent analysis across multiple metrics, reviews, and ratings.

## Features

- **Split-Screen Interface**: Clean, intuitive split-screen design for comparing two items
- **Smart Search**: Search products by name, brand, or direct URL
- **Multi-Store Support**: Searches across Amazon, BestBuy, and official stores (mock implementation)
- **Confirmation Flow**: Verify products before comparison with a smart retry system
- **Comprehensive Comparison**: Up to 12-15 key metrics compared side-by-side
- **Review Aggregation**: Combines ratings from multiple platforms
- **AI-Powered Conclusions**: Get a concise, intelligent summary of which product wins
- **Modern Dark Theme**: Soothing dark gradient background with smooth animations
- **Responsive Design**: Works beautifully on all screen sizes

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion + CSS animations
- **UI**: React with server/client components

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Comparos
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## How It Works

### 1. Search Phase
- Enter product names, brands, or URLs in either panel
- The app searches across multiple stores (currently mock data)
- Confirm the found product or retry/enter URL manually

### 2. Comparison Phase
- Once both products are locked in, click "Compare Products"
- The app analyzes specs, reviews, and ratings
- Results display side-by-side with clear winners highlighted

### 3. Results
- View detailed metric-by-metric comparison
- See aggregated reviews from multiple platforms
- Read AI-generated conclusion recommending the best choice
- Click "Compare Different Items" to start over

## Project Structure

```
Comparos/
├── app/
│   ├── api/
│   │   ├── search/          # Product search API
│   │   └── compare/         # Comparison logic API
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Main page
│   └── globals.css          # Global styles
├── components/
│   ├── SearchPanel.tsx      # Product search interface
│   ├── ProductConfirmation.tsx  # Product verification UI
│   └── ComparisonView.tsx   # Comparison results display
├── types/
│   └── index.ts             # TypeScript type definitions
└── public/                  # Static assets
```

## Current Implementation Status

### ✅ Completed
- Full UI/UX with split-screen design
- Product search and confirmation flow
- Mock product comparison API
- Side-by-side comparison display
- Review aggregation display
- AI-like conclusion generation
- Smooth animations and transitions
- Dark theme with gradients
- Reset functionality

### 🚧 To Be Implemented (Production)
- **Real Product Search**: Integrate with actual store APIs
  - Amazon Product Advertising API
  - Best Buy API
  - Web scraping for other stores
- **AI Integration**: Use GPT-4/Claude for:
  - Product specification extraction
  - Intelligent comparison analysis
  - Natural conclusion generation
- **Review Scraping**: Aggregate real reviews from multiple platforms
- **Image Processing**: Extract actual product images
- **Caching**: Add Redis/caching layer for faster responses
- **User Accounts**: Save comparison history
- **Share Feature**: Share comparison results via URL

## Customization

### Updating Colors

Edit `tailwind.config.ts` to change the color scheme:

```typescript
colors: {
  background: "#0a0a0f",  // Main background
  surface: "#1a1a24",     // Card backgrounds
  primary: "#6366f1",     // Primary accent
  secondary: "#8b5cf6",   // Secondary accent
  accent: "#ec4899",      // Tertiary accent
}
```

### Adding New Comparison Metrics

Edit `app/api/compare/route.ts` and add metrics in the `generateProductDetails` function:

```typescript
specs: [
  {
    name: 'Your Metric',
    value: 'metric value',
    importance: 'high' | 'medium' | 'low',
  },
  // ... more specs
]
```

## Domain

This project is designed for the domain **comparos.app**

To deploy:
1. Register the domain at your preferred registrar
2. Deploy to Vercel/Netlify/other hosting
3. Point DNS to your deployment

## Future Enhancements

- [ ] Browser extension for quick comparisons
- [ ] Mobile app (React Native)
- [ ] More than 2 product comparisons (3-4 items)
- [ ] Category-specific comparison metrics
- [ ] Price history tracking
- [ ] Deal alerts and notifications
- [ ] Export comparison as PDF/image
- [ ] Social sharing with preview cards

## Contributing

This is currently a prototype/MVP. Contributions welcome!

## License

MIT

---

**Made with ❤️ for smarter shopping decisions**
