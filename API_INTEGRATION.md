# PlayTak API Integration Guide

## API Overview

This dashboard integrates with the official PlayTak API to fetch game data.

**API Base URL**: `https://playtak.com/api`

## Endpoints Used

### Get Games
```
GET /v1/games?offset={offset}&limit={limit}
```

**Parameters:**
- `offset`: Starting position (0-based)
- `limit`: Number of games to fetch (max ~10000)

**Response:**
```json
{
  "games": [
    {
      "id": 123456,
      "player_white": "PlayerName1",
      "player_black": "PlayerName2",
      "result": "1-0",
      "notation": "a1,b1,c1,d1,e1,...",
      "date": 1681234567890,
      "komi": 0,
      "size": 5,
      "rating_white": 1600,
      "rating_black": 1550,
      "tournament": 0
    }
  ]
}
```

## Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Unique game identifier |
| `player_white` | string | White player username |
| `player_black` | string | Black player username |
| `result` | string | Game result ("1-0", "0-1", "R-0", "0-R", "F-0", "0-F", "0-0") |
| `notation` | string | Comma-separated move notation |
| `date` | number | Unix timestamp in milliseconds |
| `komi` | number | Komi value used |
| `size` | number | Board size (3-8) |
| `rating_white` | number | White player's ELO rating |
| `rating_black` | number | Black player's ELO rating |
| `tournament` | number | 1 = Tournament, 0 = Normal |

## Data Transformation Rules

### 1. Filter Anonymous Players
**Condition**: `player_white === 'Anon' OR player_black === 'Anon'`
**Action**: Exclude from dataset

**Reason**: Anonymous games don't represent player skill

### 2. Filter Draw Games  
**Condition**: `result === '0-0'`
**Action**: Exclude from dataset

**Reason**: Draws represent abandoned games or specific filtering need

### 3. Calculate Move Count
**Formula**: `(notation.split(',').length / 2)`
**Description**: Each move consists of two plies (white move + black move)

**Example**:
- Notation: "a1,a2,b1,b2,c1,c2"
- Commas: 5
- Moves: (6-1+1) / 2 = 3 moves

### 4. Identify Bot Players
**Logic**: Check if player name matches known bot list

**Known Bots**: 30+ including:
- TopazBot, TacticianBot, TakticianBot
- BeginnerBot, TakkerBot, BloodlessBot
- AlphaTakBot_5x5, VerekaiBot1
- And 22 more...

### 5. Format Dates
**Input**: Unix timestamp (milliseconds)
**Output**: "YYYY-MM-DD HH:MM:SS"

**Example**: 1681234567890 → "2023-04-12 03:36:07"

### 6. Normalize Komi
**Rule**: `if (komi !== 0) then komi / 2`
**Reason**: Need to standardize komi representation

### 7. Calculate Rating Difference
**Formula**: `abs(rating_white - rating_black)`
**Use**: Filter by rating difference for balanced game analysis

### 8. Filter Minimum Moves
**Condition**: `moves < (size + 1)`
**Action**: Exclude from dataset

**Reason**: Remove games that didn't reach meaningful play

## Result Code Meanings

| Code | Meaning |
|------|---------|
| 1-0 | White wins |
| 0-1 | Black wins |
| R-0 | White wins by road (game continues) |
| 0-R | Black wins by road |
| F-0 | White wins by flat |
| 0-F | Black wins by flat |
| 0-0 | Draw (abandoned/timeout) |

## Usage Examples

### Fetch First 10,000 Games
```typescript
const response = await fetch('https://playtak.com/api/v1/games?offset=0&limit=10000');
const data = await response.json();
```

### Fetch with Pagination
```typescript
let offset = 0;
const pageSize = 10000;
let allGames = [];

while (hasMore) {
  const response = await fetch(
    `https://playtak.com/api/v1/games?offset=${offset}&limit=${pageSize}`
  );
  const data = await response.json();
  
  if (data.games.length === 0) break;
  
  allGames.push(...data.games);
  offset += data.games.length;
}
```

## Rate Limiting

Current API implementation:
- No explicit rate limit documentation
- Recommended: Add delays between large requests
- Suggested: 1 request per second for batch operations would be safe

## CORS Considerations

The PlayTak API should allow cross-origin requests from browser:
- If CORS errors occur, may need a proxy backend
- Current implementation assumes CORS is enabled

## Caching Strategy

For optimal performance:

1. **First Load**: Fetch all games (or last 30 days worth)
2. **Cache**: Store in browser's localStorage
3. **Updates**: Re-fetch every 5-10 minutes
4. **Incremental**: Only fetch new games since last update

## Error Handling

Common errors:

```typescript
try {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return await response.json();
} catch (error) {
  console.error('Failed to fetch games:', error);
  // Show user-friendly error message
}
```

## Statistics Derived from API Data

### Win Percentages
- **White Wins %**: (white_wins / total_games) × 100
- **Black Wins %**: (black_wins / total_games) × 100
- **Draw %**: (draws / total_games) × 100

### Move Statistics
- **Average Moves**: sum(moves) / total_games
- **Median Moves**: Sorted middle value
- **Std Dev**: Standard deviation of move counts

### Result Distribution
- **Road Wins**: Games ending with "R" result
- **Flat Wins**: Games ending with "F" result

## Testing API Manually

**Via curl**:
```bash
curl "https://playtak.com/api/v1/games?offset=0&limit=1"
```

**Via browser**: Visit URL directly (if CORS allows)
```
https://playtak.com/api/v1/games?offset=0&limit=1
```

## References

- PlayTak Repository: https://github.com/USTakAssociation/playtak-api
- Tak Game Rules: http://www.cheapass.com/tak/
- PlayTak Main Site: https://playtak.com/

---

This documentation corresponds to the PlayTak API as of April 2026. For latest API changes, check the GitHub repository.
