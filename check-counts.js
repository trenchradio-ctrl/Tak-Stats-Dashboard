const db = require('better-sqlite3')('./public/games.db');

console.log('\n=== Database Record Counts ===\n');

const totalResult = db.prepare('SELECT COUNT(*) as total FROM games').get();
console.log('Total games in database:', totalResult.total);

const nonAnonResult = db.prepare("SELECT COUNT(*) as total FROM games WHERE player_white != 'Anon' AND player_black != 'Anon'").get();
console.log('Non-anon games:', nonAnonResult.total);

const nonAnonNonDrawResult = db.prepare("SELECT COUNT(*) as total FROM games WHERE player_white != 'Anon' AND player_black != 'Anon' AND result != '0-0'").get();
console.log('Non-anon, non-draw games:', nonAnonNonDrawResult.total);

const minMovesFilter = db.prepare(`
  SELECT COUNT(*) as total FROM games 
  WHERE player_white != 'Anon' 
  AND player_black != 'Anon' 
  AND result != '0-0'
  AND LENGTH(COALESCE(notation, '')) > 0
`).get();
console.log('Non-anon, non-draw, with notation:', minMovesFilter.total);

db.close();
