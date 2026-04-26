import Database from 'better-sqlite3';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const revalidate = 86400;
export const runtime = 'nodejs';

function getCandidateDbPaths() {
  const cwd = process.cwd();
  const envPath = process.env.GAMES_DB_PATH;
  const candidates = [
    envPath,
    path.join(cwd, 'public', 'games.db'),
    path.join(cwd, 'public', 'games_slim.db'),
    path.join(cwd, 'games.db'),
    path.join(cwd, 'games_slim.db'),
    path.join(cwd, '.next', 'server', 'public', 'games.db'),
    path.join(cwd, '.next', 'server', 'app', 'api', 'games-db', 'public', 'games.db'),
    path.join(cwd, '.next', 'standalone', 'public', 'games.db'),
    'd:\\Social Media\\Analytics Tool\\games_slim.db',
    'd:\\Social Media\\Analytics Tool\\games.db',
    'd:\\Social Media\\Analytics Tool\\Tak Games DB.db',
  ];

  return [...new Set(candidates.filter((candidate): candidate is string => Boolean(candidate)))];
}

export async function GET(request: NextRequest) {
  let db: Database.Database | null = null;
  const diagnostics: Array<{
    path: string;
    exists: boolean;
    size?: number;
    error?: string;
  }> = [];

  try {
    const dbPaths = getCandidateDbPaths();

    let dbPath = '';

    for (const tryPath of dbPaths) {
      try {
        const stat = fs.existsSync(tryPath) ? fs.statSync(tryPath) : null;
        const diagnostic = {
          path: tryPath,
          exists: Boolean(stat),
          size: stat?.size,
        };

        if (!stat) {
          diagnostics.push(diagnostic);
          continue;
        }

        db = new Database(tryPath, { readonly: true, fileMustExist: true });
        dbPath = tryPath;
        console.log(`Connected to database at: ${tryPath}`);
        break;
      } catch (e: any) {
        diagnostics.push({
          path: tryPath,
          exists: fs.existsSync(tryPath),
          size: fs.existsSync(tryPath) ? fs.statSync(tryPath).size : undefined,
          error: e.message,
        });
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
          cwd: process.cwd(),
          triedPaths: diagnostics,
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
        cwd: process.cwd(),
        triedPaths: diagnostics,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 200 }
    );
  } finally {
    db?.close();
  }
}
