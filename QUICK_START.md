# Quick Start - PlayTak Dashboard

## 🚀 Current Status

Your dashboard is **running but needs game data**. It's currently showing sample data for demonstration.

### Server URL
```
http://localhost:3000
```

## ⚠️ The Issue

The PlayTak public API endpoint is not accessible from the browser. There are several ways to fix this:

---

## ✅ Option 1: Use Your SQLite Database (Fastest - 5 minutes)

### Step 1: Install Database Support
```bash
cd "New Analytics Page"
npm install better-sqlite3
```

### Step 2: Create API Route

Create a new file: `app/api/games-db/route.ts`

```typescript
import Database from 'better-sqlite3';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Update this path to your SQLite database
    const dbPath = path.join(process.cwd(), 'public', 'games.db');
    
    const db = new Database(dbPath, { readonly: true });
    
    const games = db.prepare(`
      SELECT * FROM games LIMIT 10000
    `).all() as any[];
    
    db.close();
    
    return NextResponse.json({ games });
  } catch (error: any) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: error.message, games: [] },
      { status: 500 }
    );
  }
}
```

### Step 3: Copy Your Database

```bash
# Copy your games.db to the public folder
cp "path/to/your/games.db" "New Analytics Page/public/games.db"
```

### Step 4: Update API Client

Edit `lib/api.ts` and FIND this function:

```typescript
export async function fetchGames(offset = 0, limit = 10000): Promise<GameRecord[]> {
  try {
    const url = `/api/games?offset=${offset}&limit=${limit}`;
```

REPLACE with:

```typescript
export async function fetchGames(offset = 0, limit = 10000): Promise<GameRecord[]> {
  try {
    const url = `/api/games-db?offset=${offset}&limit=${limit}`;
```

### Step 5: Restart and Test

```bash
npm run dev
# Visit http://localhost:3000
```

✅ Dashboard should now load your data!

---

## ✅ Option 2: Using JSON File (Fast - 3 minutes)

### Step 1: Export Your Data

```bash
sqlite3 games.db ".mode json" "SELECT * FROM games;" > games.json
```

### Step 2: Create API Route

Create: `app/api/games-file/route.ts`

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  const games = (await import('@/public/games.json')).default;
  return NextResponse.json({ games });
}
```

### Step 3: Copy JSON File

```bash
cp games.json "New Analytics Page/public/games.json"
```

### Step 4: Update API Client

In `lib/api.ts`, change endpoint to:

```typescript
const url = `/api/games-file`;
```

---

## 🔄 Option 3: Run PlayTak API Locally

This is the most complete but takes longer (~15 minutes).

See `DATA_SOURCES.md` for detailed instructions.

---

## 🧪 Test the Dashboard Now

### With Sample Data (No Setup)
- Dashboard is working now with demo data
- Try the filters on the left
- Check data transformation is working

### With Your Data (After Setup)
- Restart the server: `npm run dev`
- Your real data should appear
- All filters should work with your actual games

---

## 📝 What Each File Does

| File | Purpose |
|------|---------|
| `app/api/games/route.ts` | Default API proxy (doesn't work, shows error) |
| `app/api/games-db/route.ts` | **Use this for SQLite database** |
| `app/api/games-file/route.ts` | Use this for JSON file |
| `lib/api.ts` | API client - change endpoint here |
| `DATA_SOURCES.md` | Full documentation on data sources |

---

## 🐛 Debugging

### Check Browser Console
Press `F12` → Console tab
Look for error messages like:
- "Failed to fetch from /api/games"
- Database path errors
- File not found errors

### Test Endpoint Manually
```bash
# Test SQLite endpoint
curl http://localhost:3000/api/games-db

# Test JSON endpoint
curl http://localhost:3000/api/games-file
```

### Clear Cache
```bash
rm -r .next
npm run dev
```

---

## Next Steps

1. **Choose an option** above (Option 1 is recommended)
2. **Setup your data source** (~5 minutes)
3. **Restart dashboard** - `npm run dev`
4. **Test filters** to verify it's working
5. **Deploy** when ready (see README.md for Vercel instructions)

---

## Need Help?

- Check `DATA_SOURCES.md` for full details
- Check `README.md` for architecture overview
- Check `API_INTEGRATION.md` for API reference

The dashboard is ready - just needs your data! 🎉
