import Database from 'better-sqlite3';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export const revalidate = 86400;
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  let db: Database.Database | null = null;

  try {
    // Prefer the slim database. If it has been renamed for deployment, games.db
    // may still contain the slim schema.
    const dbPaths = [
      path.join(process.cwd(), 'public', 'games_slim.db'),
      path.join(process.cwd(), 'public', 'games.db'),
      path.join(process.cwd(), 'games_slim.db'),
      path.join(process.cwd(), 'games.db'),
      'd:\\Social Media\\Analytics Tool\\games_slim.db',
      'd:\\Social Media\\Analytics Tool\\games.db',
      'd:\\Social Media\\Analytics Tool\\Tak Games DB.db',
    ];

    let dbPath = '';

    // Find the first database that exists
    for (const tryPath of dbPaths) {
      try {
        db = new Database(tryPath, { readonly: true });
        dbPath = tryPath;
        console.log(`Connected to database at: ${tryPath}`);
        break;
      } catch (e) {
        db?.close();
        continue;
      }
    }

    if (!db) {
      console.warn('No database found at:', dbPaths);
      return NextResponse.json(
        { 
          error: 'Database not found',
          message: 'Copy your games.db file to the public/ folder',
          games: [],
          triedPaths: dbPaths,
        },
        { status: 200 }
      );
    }

    const columns = db
      .prepare('PRAGMA table_info(games)')
      .all()
      .map((column: any) => column.name);
    const hasNotation = columns.includes('notation');
    const hasMoves = columns.includes('moves');

    // Fetch games from the database - load all games (with optional pagination)
    const offset = request.nextUrl.searchParams.get('offset') || '0';
    const limit = request.nextUrl.searchParams.get('limit') || '1000000'; // Default to very high limit
    
    const offsetNum = Math.max(0, parseInt(offset) || 0);
    const limitNum = Math.min(1000000, Math.max(1, parseInt(limit) || 1000000));

    const games = db
      .prepare(
        `
      SELECT
        id,
        player_white,
        player_black,
        result,
        date,
        komi,
        size,
        rating_white,
        rating_black,
        tournament
        ${hasNotation ? ', notation' : ''}
        ${hasMoves ? ', moves' : ''}
      FROM games
      LIMIT ? OFFSET ?
    `
      )
      .all(limitNum, offsetNum);

    // Also get total count
    const countResult = db.prepare('SELECT COUNT(*) as total FROM games').get() as any;
    const total = countResult.total;

    console.log(`Fetched ${games.length} games from database (offset: ${offsetNum}, total: ${total})`);

    return NextResponse.json({ 
      games,
      total,
      offset: offsetNum,
      source: dbPath.endsWith('games_slim.db') || !hasNotation ? 'sqlite-slim' : 'sqlite',
      count: games.length,
    }, {
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600',
      },
    });
  } catch (error: any) {
    console.error('Database error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Database error',
        games: [],
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 200 }
    );
  } finally {
    db?.close();
  }
}
