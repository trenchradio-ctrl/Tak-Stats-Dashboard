const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const API_BASE = 'https://api.playtak.com/v1/games-history';
const outputPath = process.argv[2] || './public/games.db';
const pageSize = Number(process.argv[3] || 5000);

const columns = [
  'id',
  'date',
  'size',
  'player_white',
  'player_black',
  'result',
  'timertime',
  'timerinc',
  'rating_white',
  'rating_black',
  'unrated',
  'tournament',
  'komi',
  'pieces',
  'capstones',
  'rating_change_white',
  'rating_change_black',
  'extra_time_amount',
  'extra_time_trigger',
  'moves',
];

function calculateMoves(notation) {
  if (!notation) return null;
  const tokens = notation.split(',').filter((token) => token.trim().length > 0);
  if (tokens.length === 0) return null;
  return Math.round(tokens.length / 2);
}

async function fetchPage(page) {
  const url = new URL(API_BASE);
  url.searchParams.set('limit', String(pageSize));
  url.searchParams.set('page', String(page));
  url.searchParams.set('order', 'ASC');
  url.searchParams.set('sort', 'id');

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`PlayTak API returned ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function main() {
  const tmpPath = `${outputPath}.tmp`;

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);

  const db = new Database(tmpPath);
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE games (
      id INTEGER PRIMARY KEY,
      date INTEGER,
      size INTEGER,
      player_white TEXT,
      player_black TEXT,
      result TEXT,
      timertime INTEGER,
      timerinc INTEGER,
      rating_white INTEGER,
      rating_black INTEGER,
      unrated INTEGER,
      tournament INTEGER,
      komi INTEGER,
      pieces INTEGER,
      capstones INTEGER,
      rating_change_white INTEGER,
      rating_change_black INTEGER,
      extra_time_amount INTEGER,
      extra_time_trigger INTEGER,
      moves INTEGER
    );
  `);

  const placeholders = columns.map(() => '?').join(', ');
  const insert = db.prepare(`INSERT INTO games (${columns.join(', ')}) VALUES (${placeholders})`);
  const insertBatch = db.transaction((games) => {
    for (const game of games) {
      const values = columns.map((column) => {
        if (column === 'moves') return calculateMoves(game.notation);
        return game[column] ?? null;
      });
      insert.run(values);
    }
  });

  let page = 0;
  let totalPages = 1;
  let copied = 0;

  while (page < totalPages) {
    const data = await fetchPage(page);
    totalPages = data.totalPages;

    insertBatch(data.items);
    copied += data.items.length;

    console.log(`Copied ${copied.toLocaleString()} / ${data.total.toLocaleString()} games`);
    page += 1;
  }

  db.exec(`
    CREATE INDEX idx_games_date ON games(date);
    CREATE INDEX idx_games_players ON games(player_white, player_black);
    CREATE INDEX idx_games_result ON games(result);
  `);
  db.close();

  for (const suffix of ['', '-wal', '-shm']) {
    const file = `${outputPath}${suffix}`;
    if (fs.existsSync(file)) fs.unlinkSync(file);
  }

  fs.renameSync(tmpPath, outputPath);
  for (const suffix of ['-wal', '-shm']) {
    const file = `${tmpPath}${suffix}`;
    if (fs.existsSync(file)) fs.unlinkSync(file);
  }

  console.log(`Updated ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
