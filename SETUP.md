# Tak Games Stats Dashboard - Quick Start Guide

## 🎮 Project Overview

This is a web-based analytics dashboard for PlayTak games that pulls real-time data from the official PlayTak API.

### Current Status
✅ **Development Server**: Running successfully
✅ **Project Structure**: Complete
✅ **Components**: Fully implemented
✅ **API Integration**: Ready

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm (comes with Node.js)

### Development

1. **Navigate to project**:
   ```bash
   cd "d:\Social Media\Analytics Tool\New Analytics Page"
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open dashboard**:
   - Visit: http://localhost:3000
   - Dashboard will auto-load games from PlayTak API

### Production Build

```bash
npm run build
npm start
```

## 📊 Features

### Statistics Dashboard
- **Total Games**: Count from filtered dataset
- **Win Percentages**: White, Black, Draw
- **Road/Flat Wins**: Estimated from results
- **Average Moves**: Mean moves across games
- **Time Series**: Bar chart showing game distribution

### Interactive Filters
- **Board Sizes**: 3-8 sizes
- **Game Types**: Tournament or Normal
- **Rating Difference**: Slider-based range
- **Player Ratings**: Separate White/Black ELO ranges
- **Time Controls**: Moves-based filtering

## 🔄 Data Transformation Pipeline

The dashboard applies these transformations to raw API data (same as your SQL):

```
Raw API Data
    ↓
Remove "Anon" players
    ↓
Remove results = "0-0"
    ↓
Calculate moves from notation
    ↓
Identify bots using known player list
    ↓
Format timestamps
    ↓
Normalize komi values (÷ 2)
    ↓
Filter by minimum moves
    ↓
Display filtered statistics
```

## 📁 Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/
│   ├── Dashboard.tsx       # Main component
│   ├── StatCard.tsx        # Stat display
│   ├── Filters.tsx         # Filter sidebar
│   └── TimeSeriesChart.tsx # Chart
├── lib/
│   ├── api.ts             # API client
│   └── dataTransform.ts   # Data transformation
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## 🌐 Deployment

### To Vercel (Recommended)
1. Push code to GitHub
2. Go to https://vercel.com
3. Connect your GitHub repository
4. Vercel auto-detects Next.js and deploys
5. Your site is live!

### To Custom Server
1. Build: `npm run build`
2. Start: `npm start`
3. Deploy the entire project directory

## 📊 Bot Detection List

The dashboard identifies 30+ known bot accounts automatically:
- TopazBot
- TacticianBot, TakticianBot
- BeginnerBot
- TakkerBot
- BloodlessBot
- AlphaTakBot_5x5
- And 23+ more...

See `lib/dataTransform.ts` for the complete list.

## 🔧 Customization

### Adjust data fetch size
Edit in `lib/api.ts`:
```typescript
const pageSize = 10000; // Change this number
```

### Modify filters
Edit in `components/Filters.tsx` and `app/page.tsx`

### Change styling
All Tailwind classes can be edited in component files

### Add more statistics
Edit `lib/dataTransform.ts` `calculateStats()` function

## 🐛 Troubleshooting

### Port 3000 already in use?
```bash
npm run dev -- --port 3001
```

### Need to reset project?
```bash
rm -r .next node_modules
npm install
npm run dev
```

### API not responding?
- Check internet connection
- Verify PlayTak API is accessible: https://playtak.com/api/v1/games?offset=0&limit=1

## 📝 Next Steps

### Future Enhancements
- [ ] Player statistics page
- [ ] Head-to-head comparisons
- [ ] Opening analysis
- [ ] Real-time updates with WebSockets
- [ ] Export data functionality
- [ ] Advanced filtering options
- [ ] Custom date ranges
- [ ] More visualization types

### Performance Optimization
- Implement data caching
- Add pagination for large datasets
- Use React Query for API management
- Optimize chart rendering

## 📚 Documentation

- Full README: [README.md](README.md)
- Next.js Docs: https://nextjs.org/docs
- PlayTak API: https://github.com/USTakAssociation/playtak-api
- Chart.js Docs: https://www.chartjs.org/docs/latest/

## 💡 Tips

1. **For production**: Implement proper error handling and data caching
2. **Performance**: Consider limiting initial data load to last 30 days
3. **User experience**: Add loading skeletons for better UX
4. **Analytics**: Consider adding page tracking
5. **Updates**: Set up auto-refresh of data every 5-10 minutes

---

**Ready to go?** Run `npm run dev` and visit http://localhost:3000!
