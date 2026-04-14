# Tak Games Stats Dashboard

A modern web-based analytics dashboard for PlayTak games, featuring real-time statistics, interactive filters, and visualizations.

## Features

- **Real-time Data**: Pulls game data directly from the [PlayTak API](https://github.com/USTakAssociation/playtak-api)
- **Interactive Filters**: Filter games by board size, komi, game type, player ratings, and more
- **Statistics Dashboard**: View comprehensive game statistics including win percentages, move averages, and more
- **Time Series Visualization**: See game activity over time with interactive bar charts
- **Dark Theme UI**: Professional dark interface optimized for long viewing sessions

## Data Transformations

The dashboard applies the following transformations to raw API data:

1. **Remove anonymous games**: Filters out games with 'Anon' as player
2. **Remove draws**: Eliminates games with '0-0' result
3. **Calculate moves**: Derives move count from notation string
4. **Identify bots**: Classifies games as 'Bot' or 'Human' based on player names
5. **Format dates**: Converts Unix timestamps to readable format
6. **Normalize komi**: Divides non-zero komi values by 2
7. **Filter minimum moves**: Removes games below (board_size + 1) moves

## Tech Stack

- **Frontend**: Next.js 15 with React 18
- **Styling**: Tailwind CSS
- **Charts**: Chart.js with react-chartjs-2
- **Language**: TypeScript
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd new-analytics-page
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

## Deployment

This project is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Vercel will automatically detect a Next.js project and configure build settings
4. Your site will be live!

For manual deployment instructions, see [Vercel Docs](https://vercel.com/docs)

## API Integration

The dashboard fetches data from the PlayTak API:
- **Base URL**: `https://playtak.com/api`
- **Endpoint**: `/v1/games?offset=0&limit=10000`

### Example API Response Structure:
```json
{
  "games": [
    {
      "id": 1,
      "player_white": "PlayerA",
      "player_black": "PlayerB",
      "result": "1-0",
      "notation": "a1,a2,a3,...",
      "date": 1234567890000,
      "komi": 0,
      "size": 5,
      "rating_white": 1600,
      "rating_black": 1500,
      "tournament": 0
    }
  ]
}
```

## File Structure

```
├── app/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
├── components/
│   ├── Dashboard.tsx        # Main dashboard component
│   ├── StatCard.tsx         # Stat display card
│   ├── Filters.tsx          # Filter sidebar
│   └── TimeSeriesChart.tsx  # Chart visualization
├── lib/
│   ├── api.ts              # API client functions
│   └── dataTransform.ts    # Data transformation utilities
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── README.md
```

## Key Components

### Dashboard
Main component that orchestrates data fetching, filtering, and display.

### Filters
Left sidebar with interactive filters for:
- Board size (3-8)
- Game type (Tournament/Normal)
- Rating differences
- Player ratings (White/Black)
- Time controls

### StatCard
Reusable component for displaying key metrics.

### TimeSeriesChart
Bar chart showing game distribution over time using Chart.js.

## Data Transformation Pipeline

1. **Fetch**: Get games from PlayTak API
2. **Filter**: Remove anonymous games and draws
3. **Transform**: 
   - Calculate moves from notation
   - Identify bots
   - Format dates
   - Calculate rating differences
4. **Display**: Show filtered and aggregated statistics

## Future Enhancements

- [ ] Player statistics page
- [ ] Head-to-head comparisons
- [ ] Opening analysis
- [ ] Real-time updates with WebSockets
- [ ] Export data functionality
- [ ] Advanced filtering options
- [ ] Custom date ranges
- [ ] More visualization types

## Development Notes

- The dashboard currently fetches 10,000 games on startup for performance. Adjust the limit in `lib/api.ts` as needed.
- CORS headers from PlayTak API should allow direct browser requests
- Consider implementing caching strategies for large datasets
- Time series data is grouped by day and shows the last 60 days

## License

This project is built for the PlayTak community. For license information, see the PlayTak repository.

## Support

For issues with the PlayTak API endpoint, visit: https://github.com/USTakAssociation/playtak-api

For dashboard-specific issues, create an issue in this repository.
