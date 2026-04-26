const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const sourcePath = process.argv[2] || './public/games.db';
const outputPath = process.argv[3] || './public/games_slim.db';

console.log('Creating slim database without notation column, preserving derived moves...\n');

function calculateMoves(notation) {
  if (!notation) return null;
  const tokens = notation.split(',').filter((token) => token.trim().length > 0);
  if (tokens.length === 0) return null;
  return Math.round(tokens.length / 2);
}

// Open original database
const originalDb = new Database(sourcePath, { readonly: true });

// Check original size
const originalSize = fs.statSync(sourcePath).size;
console.log(`Original database size: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);

// Create new database without notation
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
if (fs.existsSync(outputPath)) {
  fs.unlinkSync(outputPath);
}
const slimDb = new Database(outputPath);

// Get the schema (without notation column)
const schema = originalDb.prepare(`
  SELECT sql FROM sqlite_master 
  WHERE type='table' AND name='games'
`).get();

console.log('Creating new table without notation column...');

// Modify the CREATE TABLE statement to exclude notation
let modifiedSchema = schema.sql;
modifiedSchema = modifiedSchema.replace(/,\s*notation\s+TEXT/i, '');
modifiedSchema = modifiedSchema.replace(/\s+notation\s+TEXT/i, '');
modifiedSchema = modifiedSchema.replace(/\)$/, ', moves INTEGER)');

// Create table in new database
try {
  slimDb.exec('DROP TABLE IF EXISTS games');
} catch(e) {}
slimDb.exec(modifiedSchema);

// Copy data without notation column, adding derived moves from notation.
const sourceColumns = originalDb.pragma('table_info(games)').map(col => col.name);
const hasNotation = sourceColumns.includes('notation');
const columns = sourceColumns.filter(col => col !== 'notation' && col !== 'moves');
const outputColumns = [...columns, 'moves'];
const columnList = outputColumns.join(', ');
const placeholders = outputColumns.map(() => '?').join(', ');

const totalGames = originalDb.prepare('SELECT COUNT(*) as count FROM games').get().count;
console.log(`Copying ${totalGames.toLocaleString()} games...`);

const insertStmt = slimDb.prepare(`INSERT INTO games (${columnList}) VALUES (${placeholders})`);
const selectColumns = hasNotation ? [...columns, 'notation'] : columns;
const selectStmt = originalDb.prepare(`SELECT ${selectColumns.join(', ')} FROM games`);

const transaction = slimDb.transaction((rows) => {
  for (const row of rows) {
    const moves = hasNotation ? calculateMoves(row.notation) : (row.moves ?? null);
    const values = columns.map((column) => row[column]);
    insertStmt.run(...values, moves);
  }
});

const batchSize = 10000;
let copied = 0;
let batch = [];

for (const row of selectStmt.iterate()) {
  batch.push(row);

  if (batch.length === batchSize) {
    transaction(batch);
    copied += batch.length;
    console.log(`  Copied ${copied.toLocaleString()} / ${totalGames.toLocaleString()}`);
    batch = [];
  }
}

if (batch.length > 0) {
  transaction(batch);
  copied += batch.length;
}

console.log(`Copied ${copied.toLocaleString()} games\n`);

// Create indexes if they exist in original
const indexes = originalDb.prepare(`
  SELECT sql FROM sqlite_master 
  WHERE type='index' AND name NOT LIKE 'sqlite_%'
`).all();

for (const index of indexes) {
  try {
    slimDb.exec(index.sql);
  } catch(e) {
    // Index might reference notation, skip if error
    console.log(`Skipped index: ${index.sql.substring(0, 50)}...`);
  }
}

// Get final sizes
const slimSize = fs.statSync(outputPath).size;
console.log(`Original database: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`Slim database:     ${(slimSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`Size reduction:    ${((1 - slimSize / originalSize) * 100).toFixed(1)}%\n`);

originalDb.close();
slimDb.close();

if (slimSize < originalSize) {
  console.log('✅ Slim database created successfully!\n');
  console.log('To use it, rename it:');
  console.log('  mv public/games_slim.db public/games.db');
  console.log('\nOr keep the original and update the API to use games_slim.db');
}
