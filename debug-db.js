const db = require('better-sqlite3')('./public/games.db', {readonly: true});

// Find bots
console.log('Bots in database:');
const bots = db.prepare("SELECT DISTINCT player_white as name FROM games WHERE player_white LIKE '%bot%' OR player_white LIKE '%Bot%' UNION SELECT DISTINCT player_black as name FROM games WHERE player_black LIKE '%bot%' OR player_black LIKE '%Bot%' ORDER BY name").all();
bots.forEach(b => console.log('  "' + b.name + '",'));

console.log('\nBot count:', bots.length);

// Check tournament values
console.log('\nUnique tournament values:');
const tournaments = db.prepare("SELECT DISTINCT tournament FROM games").all();
tournaments.forEach(t => console.log('  tournament:', t.tournament));

// Check game counts after filtering
console.log('\nGame counts:');
const counts = db.prepare("SELECT COUNT(*) as total, SUM(CASE WHEN player_white != 'Anon' AND player_black != 'Anon' AND result != '0-0' AND result != '1/2-1/2' THEN 1 ELSE 0 END) as non_filtered FROM games").get();
console.log('  Total:', counts.total);
console.log('  After anon/draw filter:', counts.non_filtered);

db.close();
