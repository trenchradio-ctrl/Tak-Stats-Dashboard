const Database = require('better-sqlite3');
const fs = require('fs');

console.log('Creating slim database without notation column...\n');

// Open original database
const originalDb = new Database('./public/games.db', { readonly: true });

// Check original size
const originalSize = fs.statSync('./public/games.db').size;
console.log(`Original database size: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);

// Create new database without notation
const slimDb = new Database('./public/games_slim.db');

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

// Create table in new database
try {
  slimDb.exec('DROP TABLE IF EXISTS games');
} catch(e) {}
slimDb.exec(modifiedSchema);

// Copy data without notation column
const columns = originalDb.pragma('table_info(games)').map(col => col.name).filter(col => col !== 'notation');
const columnList = columns.join(', ');
const placeholders = columns.map(() => '?').join(', ');

const totalGames = originalDb.prepare('SELECT COUNT(*) as count FROM games').get().count;
console.log(`Copying ${totalGames.toLocaleString()} games...`);

const insertStmt = slimDb.prepare(`INSERT INTO games (${columnList}) VALUES (${placeholders})`);
const selectStmt = originalDb.prepare(`SELECT ${columnList} FROM games`);

const transaction = slimDb.transaction((rows) => {
  for (const row of rows) {
    insertStmt.run(...Object.values(row));
  }
});

const batchSize = 10000;
let copied = 0;

const allRows = selectStmt.all();
transaction(allRows);
copied = allRows.length;

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
const slimSize = fs.statSync('./public/games_slim.db').size;
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
