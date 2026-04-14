# PlayTak API Data Source Guide

## Current Status

⚠️ **API Endpoint Issue**: The PlayTak public API endpoint is not currently accessible for data retrieval.

The application attempted to connect to `https://api.playtak.com/api/v1/games-history` but the endpoint returns 404.

## Solution Options

### Option 1: Use Local SQLite Database (Recommended for Your Use Case)

Since you already have a SQLite database with game data, use that directly:

#### Step 1: Set Up Database Endpoint

Create a new API route that reads from your SQLite database:

```bash
npm install better-sqlite3
```

#### Step 2: Create Database API Route

Create `app/api/games-db/route.ts`:

```typescript
import Database from 'better-sqlite3';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Update this path to your SQLite database location
    const dbPath = path.join(process.cwd(), 'public', 'games.db');
    
    const db = new Database(dbPath, { readonly: true });
    
    const games = db.prepare(`
      SELECT * FROM games
      WHERE (player_white != 'Anon' AND player_black != 'Anon')
      AND result != '0-0'
      LIMIT 10000
    `).all();
    
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

#### Step 3: Update API Client

Edit `lib/api.ts` and change the endpoint:

```typescript
export async function fetchGames(offset = 0, limit = 10000): Promise<GameRecord[]> {
  const url = `/api/games-db?offset=${offset}&limit=${limit}`;
  const response = await fetch(url);
  const data: ApiGamesResponse = await response.json();
  return data.games || [];
}
```

#### Step 4: Place Your Database

- Copy your `games.db` SQLite file to `public/games.db`
- Or update the path in the API route above

---

### Option 2: Run PlayTak API Locally

If you want to use the official PlayTak API:

#### Step 1: Clone the Repository

```bash
cd ..
git clone https://github.com/USTakAssociation/playtak-api.git
cd playtak-api
```

#### Step 2: Set Up Local API

```bash
nvm use
cd api
npm install
cd ..
bash ./scripts/development/create_databases.sh
docker compose up -d --build
```

#### Step 3: Update Dashboard Configuration

Update `lib/api.ts`:

```typescript
const API_BASE = 'http://localhost:3001/api'; // Local API port
```

#### Step 4: Update API Route

Edit `app/api/games/route.ts`:

```typescript
const API_BASE = 'http://localhost:3001/api';

export async function GET(request: NextRequest) {
  const url = `${API_BASE}/v1/games-history`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    return NextResponse.json({ games: [], error: `API error: ${response.status}` });
  }

  const data = await response.json();
  return NextResponse.json(data);
}
```

---

### Option 3: Load Data from CSV/JSON File

If you want to use a pre-exported dataset:

#### Step 1: Export Your Data

Export from SQLite to JSON:

```bash
sqlite3 games.db "SELECT * FROM games;" | sqlite3 -json > games.json
```

#### Step 2: Create API Route

Create `app/api/games-file/route.ts`:

```typescript
import { readFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'games.json');
    const fileContent = await readFile(filePath, 'utf-8');
    const games = JSON.parse(fileContent);
    return NextResponse.json({ games });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load file', games: [] }, { status: 500 });
  }
}
```

#### Step 3: Place Your File

- Copy your exported `games.json` to `public/games.json`

---

### Option 4: Implement Data Import Form

Allow users to upload their own database file:

Create `components/DataImport.tsx`:

```typescript
'use client';

import { useState } from 'react';

export default function DataImport() {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload-games', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        // Reload dashboard or refresh games
        window.location.reload();
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h3 className="text-white mb-2">Import Game Data</h3>
      <input
        type="file"
        accept=".db,.json,.csv"
        onChange={handleFileUpload}
        disabled={uploading}
      />
      {uploading && <p className="text-gray-400 mt-2">Uploading...</p>}
    </div>
  );
}
```

---

## Quick Fix: How to Make It Work Right Now

### If You Have Your SQLite Database

1. **Copy Your Database**:
   ```bash
   cp "path/to/your/games.db" "New Analytics Page/public/games.db"
   ```

2. **Install Database Package**:
   ```bash
   cd "New Analytics Page"
   npm install better-sqlite3
   ```

3. **Create Database Route** (copy the code from Option 1 above)

4. **Update the API client** (as shown in Option 1, Step 3)

5. **Restart Dashboard**:
   ```bash
   npm run dev
   ```

---

## Troubleshooting

### "Failed to fetch" Error

1. Check browser DevTools (F12) → Network tab
2. Look for failed requests to `/api/games`
3. Check console for error messages

### "No games loaded"

**Possible causes:**
- Database file not found
- Database has no data
- Query filtering removed all games
- API endpoint is down

**Solutions:**
- Verify database exists at specified path
- Check database has tables named `games`
- Check that there's data after filtering (see data transformation rules)

### Port Already in Use

```bash
npm run dev -- --port 3001
```

---

## Testing Your Data Source

### Test SQLite Connection

```typescript
// In browser console or test file
fetch('/api/games-db')
  .then(r => r.json())
  .then(data => console.log(data))
```

### Test Local API

```bash
curl http://localhost:3001/api/v1/games-history
```

### Check Transformed Data

```typescript
import { transformGamesData } from '@/lib/dataTransform';

const rawGames = await fetchGames();
console.log('Raw games:', rawGames.length);

const transformed = transformGamesData(rawGames);
console.log('Transformed games:', transformed.length);
```

---

## Data Formats

### SQLite Table Structure

```sql
CREATE TABLE games (
  id INTEGER PRIMARY KEY,
  player_white TEXT,
  player_black TEXT,
  result TEXT,
  notation TEXT,
  date INTEGER,
  komi REAL,
  size INTEGER,
  rating_white INTEGER,
  rating_black INTEGER,
  tournament INTEGER
);
```

### JSON Array Format

```json
{
  "games": [
    {
      "id": 1,
      "player_white": "PlayerA",
      "player_black": "PlayerB",
      "result": "1-0",
      "notation": "a1,a2,b1,b2",
      "date": 1681234567890,
      "komi": 0,
      "size": 5,
      "rating_white": 1600,
      "rating_black": 1500,
      "tournament": 0
    }
  ]
}
```

---

## Recommended Setup

For the fastest setup with your existing data:

1. Use **Option 1** (SQLite Database) if you have your database file
2. Place it in `public/games.db`
3. Create the API route with `better-sqlite3`
4. Update `lib/api.ts` to point to `/api/games-db`
5. Restart and test

This takes about 5 minutes and will get your dashboard working immediately.

---

## Next Steps

Once you have data loading:

1. **Test with Sample Data**: The dashboard includes sample data generation
2. **Verify Transformations**: Check that data filtering works correctly
3. **Export and Share**: The dashboard can be deployed to Vercel
4. **Add More Features**: Consider implementing real-time updates, caching, etc.

For questions about specific implementations, check the Next.js documentation or create an issue in your repository.
