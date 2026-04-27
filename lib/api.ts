// Use our Next.js backend API route to avoid CORS issues
// Supports: SQLite database, JSON files, or direct API calls

export interface GameRecord {
  id: number;
  player_white: string;
  player_black: string;
  result: string;
  notation?: string;
  date: number;
  komi: number;
  size: number;
  rating_white: number;
  rating_black: number;
  tournament: number;
  moves?: number;
  timertime?: number;
}

export interface ApiGamesResponse {
  games: GameRecord[];
  error?: string;
  note?: string;
}

/**
 * Fetch games from PlayTak API via our backend proxy
 * @param offset - Starting position for pagination
 * @param limit - Number of games to fetch (0 = all)
 */
export async function fetchGames(
  offset: number = 0,
  limit: number = 0
): Promise<GameRecord[]> {
  try {
    // Use very high limit if not specified to load all games
    const queryLimit = limit || 1000000;
    const url = `/api/games-db?offset=${offset}&limit=${queryLimit}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data: ApiGamesResponse = await response.json();
    
    if (data.error) {
      console.warn('Database warning:', data.error);
      throw new Error(data.error);
    }
    
    return data.games || [];
  } catch (error) {
    console.error('Failed to fetch games:', error);
    throw error;
  }
}

/**
 * Fetch games with pagination support
 */
export async function fetchAllGames(
  onProgress?: (current: number, total: number) => void
): Promise<GameRecord[]> {
  const allGames: GameRecord[] = [];
  const pageSize = 10000;
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    try {
      const games = await fetchGames(offset, pageSize);

      if (games.length === 0) {
        hasMore = false;
      } else {
        allGames.push(...games);
        offset += games.length;
        onProgress?.(allGames.length, allGames.length); // Update progress
      }
    } catch (error) {
      console.error(`Error fetching games at offset ${offset}:`, error);
      hasMore = false;
    }
  }

  return allGames;
}

/**
 * Fetch player statistics
 */
export async function fetchPlayerStats(playerName: string) {
  try {
    const url = `/api/player/${encodeURIComponent(playerName)}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch stats for ${playerName}:`, error);
    throw error;
  }
}

/**
 * Get sample/mock data for development and testing
 * This helps when the API is not available
 */
export function getSampleGames(): GameRecord[] {
  const playerNames = [
    'PlayerA', 'PlayerB', 'PlayerC', 'PlayerD', 'PlayerE',
    'TopazBot', 'TacticianBot', 'BeginnerBot', 'AlphaTakBot',
  ];
  
  const results = ['1-0', '0-1', 'R-0', '0-R', 'F-0', '0-F'];
  const games: GameRecord[] = [];

  // Generate 50 sample games spread over time
  const now = Date.now();
  for (let i = 0; i < 50; i++) {
    const whiteIdx = Math.floor(Math.random() * playerNames.length);
    const blackIdx = Math.floor(Math.random() * playerNames.length);
    const resultIdx = Math.floor(Math.random() * results.length);
    const sizeIdx = Math.floor(Math.random() * 3); // 3, 4, or 5
    
    const size = [3, 4, 5][sizeIdx];
    const moves = (size + 1) + Math.floor(Math.random() * 40);
    
    // Create notation string
    const notation = Array.from({ length: moves * 2 }, (_, i) => {
      const col = String.fromCharCode(97 + (i % 5)); // a-e
      const row = ((i / 5) % 5) + 1; // 1-5
      return `${col}${row}`;
    }).join(',');

    games.push({
      id: i + 1,
      player_white: playerNames[whiteIdx],
      player_black: playerNames[blackIdx],
      result: results[resultIdx],
      notation: notation,
      date: now - (i * 86400000), // Spread over days
      komi: 0,
      size: size,
      rating_white: 1400 + Math.random() * 400,
      rating_black: 1400 + Math.random() * 400,
      tournament: Math.random() > 0.8 ? 1 : 0,
    });
  }
  
  return games;
}
