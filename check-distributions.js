const db = require('better-sqlite3')('./public/games.db');

// Count games by size
console.log('Games by size:');
[3, 4, 5, 6, 7, 8].forEach(size => {
  const result = db.prepare('SELECT COUNT(*) as t FROM games WHERE size = ?').get(size);
  console.log(`  Size ${size}: ${result.t}`);
});

// Count games by rating ranges
const ranges = [
  { name: '< 1000', min: 0, max: 1000 },
  { name: '1000-1500', min: 1000, max: 1500 },
  { name: '1500-2000', min: 1500, max: 2000 },
  { name: '2000-2500', min: 2000, max: 2500 },
  { name: '2500+', min: 2500, max: 5000 },
];

console.log('\nGames by rating:');
ranges.forEach(r => {
  const result = db.prepare('SELECT COUNT(*) as t FROM games WHERE (rating_white >= ? OR rating_white IS NULL) AND (rating_white <= ? OR rating_white IS NULL) AND (rating_black >= ? OR rating_black IS NULL) AND (rating_black <= ? OR rating_black IS NULL)').get(r.min, r.max, r.min, r.max);
  console.log(`  ${r.name}: ${result.t}`);
});

// Specific check for 48730
const around48k = db.prepare('SELECT COUNT(*) as t FROM games WHERE id <= 48730').get();
console.log('\nGames with id <= 48730:', around48k.t);

// Check if maybe it's by komi
console.log('\nGames by komi:');
const komis = db.prepare('SELECT DISTINCT komi FROM games ORDER BY komi').all();
komis.forEach(k => {
  const result = db.prepare('SELECT COUNT(*) as t FROM games WHERE komi = ?').get(k.komi);
  console.log(`  Komi ${k.komi}: ${result.t}`);
});

db.close();
