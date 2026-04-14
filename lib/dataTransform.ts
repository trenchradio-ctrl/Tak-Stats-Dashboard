// List of bot player names
export const BOT_NAMES = [
  'AaaarghBot',
  'AlphaTakBot_5x5',
  'AltCobbleBot',
  'BeginnerBot',
  'BloodlessBot',
  'Bot1',
  'BotheredFool',
  'BottomBanana',
  'Botz',
  'CairnBot',
  'CataklysmBot',
  'CobbleBot',
  'CrumBot',
  'Diegolibot',
  'DoubleStackBot',
  'ElBotanisto',
  'FPABot',
  'Fatrobot',
  'FlashBot',
  'FriendlyBot',
  'IntuitionBot',
  'Kubote',
  'ManicBot',
  'Megabot10',
  'Murderbot11',
  'OiBotti',
  'PizzaBot',
  'RoboticSlayer45',
  'SamBot',
  'SelfEsteemBot',
  'ShlktBot',
  'SlateBot',
  'Srebotnjak',
  'TakkenBot',
  'TakkerBot',
  'TakkerusBot',
  'TakticBot',
  'Takticbot',
  'TakticianBot',
  'TakticianBotDev',
  'Tiltak_Bot',
  'TopazBot',
  'TrigeerBot',
  'VerekaiBot1',
  'WilemBot',
  'ZachBot',
  'alphabot',
  'alphatak_bot',
  'alphatak_bot1',
  'antakonistbot',
  'bartlebot',
  'borobotos',
  'botimer',
  'botpopter',
  'cutak_bot',
  'ditakticBot',
  'edubot',
  'kriTakBot',
  'liambot123',
  'mankBot',
  'pablobotet',
  'robot',
  'roboticgazelle',
  'roboticist',
  'sTAKbot',
  'sTAKbot1',
  'sTAKbot2',
  'saibot',
  'shamthebot',
  'takkybot',
  'xSENTIENTROBOTx',
  'zacbot',
];

export interface GameData {
  ids: number[];
  player_white: string[];
  player_black: string[];
  result: string[];
  notation: string[];
  date: number[];
  komi: number[];
  size: number[];
  rating_white: number[];
  rating_black: number[];
  tournament: number[];
  moves?: number[];
  BotGame?: string[];
  date_formatted?: string[];
  rating_difference?: number[];
}

export interface TransformedGame {
  id: number;
  player_white: string;
  player_black: string;
  result: string;
  date: number;
  date_formatted: string;
  komi: number;
  size: number;
  rating_white: number;
  rating_black: number;
  tournament: string;
  moves: number;
  BotGame: string;
  rating_difference: number;
}

/**
 * Calculate the number of moves from notation string
 */
export function calculateMoves(notation: string): number {
  if (!notation) return 0;
  const moveCount = (notation.match(/,/g) || []).length + 1;
  return Math.round(moveCount / 2);
}

/**
 * Determine if player is a bot
 */
export function isBotPlayer(playerName: string): boolean {
  return BOT_NAMES.includes(playerName);
}

/**
 * Determine game type (Bot or Human)
 */
export function getGameType(playerWhite: string, playerBlack: string): string {
  if (isBotPlayer(playerWhite) || isBotPlayer(playerBlack)) {
    return 'Bot';
  }
  return 'Human';
}

/**
 * Format Unix timestamp
 */
export function formatDate(timestamp: number): string {
  try {
    const date = new Date(timestamp);
    return date.toISOString().replace('T', ' ').substring(0, 19);
  } catch {
    return '';
  }
}

/**
 * Transform raw API data according to SQL transformation rules
 */
export function transformGamesData(rawGames: any[]): TransformedGame[] {
  console.log(`Transforming ${rawGames.length} raw games...`);
  
  let anonRemoved = 0;
  let drawsRemoved = 0;
  let lowMovesRemoved = 0;
  let successCount = 0;

  const result = rawGames
    .filter((game) => {
      // Remove anonymous players
      if (game.player_white === 'Anon' || game.player_black === 'Anon') {
        anonRemoved++;
        return false;
      }
      // Remove draw results
      if (game.result === '0-0') {
        drawsRemoved++;
        return false;
      }
      return true;
    })
    .map((game) => {
      const moves = calculateMoves(game.notation || '');
      
      // Filter out games with too few moves
      if (moves < game.size + 1) {
        lowMovesRemoved++;
        return null;
      }

      successCount++;
      return {
        id: game.id || Date.now(),
        player_white: game.player_white,
        player_black: game.player_black,
        result: game.result,
        date: game.date,
        date_formatted: formatDate(game.date),
        komi: game.komi !== 0 ? game.komi / 2 : game.komi,
        size: game.size,
        rating_white: game.rating_white,
        rating_black: game.rating_black,
        tournament: game.tournament === 1 ? 'Tournament' : (game.tournament === 0 ? 'Normal' : game.tournament),
        moves,
        BotGame: getGameType(game.player_white, game.player_black),
        rating_difference: Math.abs(game.rating_white - game.rating_black),
      };
    })
    .filter((game): game is TransformedGame => game !== null);

  console.log(`Transform complete: ${successCount} games kept, ${anonRemoved} anon removed, ${drawsRemoved} draws removed, ${lowMovesRemoved} low moves removed`);
  
  return result;
}

/**
 * Parse game result and determine winner
 * Result formats: "1-0", "0-1", "R-0", "0-R", "F-0", "0-F", "0-0", "1/2-1/2"
 */
export function parseResult(result: string): {
  whiteWins: boolean;
  blackWins: boolean;
  isDraw: boolean;
} {
  if (!result) {
    return { whiteWins: false, blackWins: false, isDraw: true };
  }

  // Handle fractional draws (1/2-1/2)
  if (result.includes('1/2')) {
    return { whiteWins: false, blackWins: false, isDraw: true };
  }

  // Handle 0-0 draws
  if (result === '0-0') {
    return { whiteWins: false, blackWins: false, isDraw: true };
  }

  // Parse standard format: "1-0", "0-1", "R-0", "0-R", "F-0", "0-F"
  const parts = result.split('-');
  if (parts.length !== 2) {
    return { whiteWins: false, blackWins: false, isDraw: true };
  }

  const whitePart = parts[0].trim();
  const blackPart = parts[1].trim();

  // Check if either side won (could be 1, R, or F)
  const whiteWon = whitePart !== '0';
  const blackWon = blackPart !== '0';

  if (whiteWon && !blackWon) {
    return { whiteWins: true, blackWins: false, isDraw: false };
  } else if (!whiteWon && blackWon) {
    return { whiteWins: false, blackWins: true, isDraw: false };
  } else {
    return { whiteWins: false, blackWins: false, isDraw: true };
  }
}

/**
 * Calculate statistics from games
 */
export interface GameStats {
  totalGames: number;
  whiteWinCount: number;
  blackWinCount: number;
  drawCount: number;
  whiteWinPercentage: number;
  blackWinPercentage: number;
  drawPercentage: number;
  avgMoves: number;
  roadWinPercentage: number;
  flatWinPercentage: number;
}

export function calculateStats(games: TransformedGame[]): GameStats {
  const totalGames = games.length;

  if (totalGames === 0) {
    return {
      totalGames: 0,
      whiteWinCount: 0,
      blackWinCount: 0,
      drawCount: 0,
      whiteWinPercentage: 0,
      blackWinPercentage: 0,
      drawPercentage: 0,
      avgMoves: 0,
      roadWinPercentage: 0,
      flatWinPercentage: 0,
    };
  }

  let whiteWins = 0;
  let blackWins = 0;
  let draws = 0;
  let totalMoves = 0;
  let roadWins = 0;
  let flatWins = 0;

  games.forEach((game) => {
    const { whiteWins: ww, blackWins: bw, isDraw } = parseResult(game.result);

    if (ww) whiteWins++;
    if (bw) blackWins++;
    if (isDraw) draws++;

    totalMoves += game.moves;

    // Determine if win is by road or flat
    // Result formats: "R-0" (road white), "0-R" (road black), "F-0" (flat white), "0-F" (flat black)
    if (!isDraw) {
      if (game.result.includes('R')) {
        roadWins++;
      } else if (game.result.includes('F')) {
        flatWins++;
      }
    }
  });

  // Calculate road/flat percentages out of total wins (not total games)
  const totalWins = whiteWins + blackWins;
  const roadWinPercentage = totalWins > 0 ? ((roadWins / totalWins) * 100).toFixed(2) : 0;
  const flatWinPercentage = totalWins > 0 ? ((flatWins / totalWins) * 100).toFixed(2) : 0;

  return {
    totalGames,
    whiteWinCount: whiteWins,
    blackWinCount: blackWins,
    drawCount: draws,
    whiteWinPercentage: ((whiteWins / totalGames) * 100).toFixed(2) as any,
    blackWinPercentage: ((blackWins / totalGames) * 100).toFixed(2) as any,
    drawPercentage: ((draws / totalGames) * 100).toFixed(2) as any,
    avgMoves: (totalMoves / totalGames).toFixed(1) as any,
    roadWinPercentage: roadWinPercentage as any,
    flatWinPercentage: flatWinPercentage as any,
  };
}
