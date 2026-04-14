const db = require('better-sqlite3')('./public/games.db');

const ratedGames = db.prepare('SELECT COUNT(*) as t FROM games WHERE unrated = 0').get();
console.log('Rated games:', ratedGames.t);

const unratedGames = db.prepare('SELECT COUNT(*) from games WHERE unrated = 1').get();
console.log('Unrated games:', unratedGames.t);

const tournamentGames = db.prepare('SELECT COUNT(*) as t FROM games WHERE tournament = 1').get();
console.log('Tournament games:', tournamentGames.t);

const normalGames = db.prepare('SELECT COUNT(*) as t FROM games WHERE tournament = 0').get();
console.log('Normal games:', normalGames.t);

// Check human-only games (no bots)
const humanGames = db.prepare(`
  SELECT COUNT(*) as t FROM games 
  WHERE player_white NOT IN (
    'CobbleBot', 'Tiltak_Bot', 'AlphaTakBot_5x5', 'VerekaiBot1', 'TakticianBot', 
    'BeginnerBot', 'TakkerBot', 'BloodlessBot', 'takkybot', 'ShlktBot', 'IntuitionBot', 
    'alphatak_bot', 'alphabot', 'TakkerusBot', 'TakkenBot', 'kriTakBot', 'robot', 
    'AaaarghBot', 'CrumBot', 'WilemBot', 'SlateBot', 'TakticianBotDev', 'ManicBot',
    'CataklysmBot', 'FPABot'
  )
  AND player_black NOT IN (
    'CobbleBot', 'Tiltak_Bot', 'AlphaTakBot_5x5', 'VerekaiBot1', 'TakticianBot',
    'BeginnerBot', 'TakkerBot', 'BloodlessBot', 'takkybot', 'ShlktBot', 'IntuitionBot',
    'alphatak_bot', 'alphabot', 'TakkerusBot', 'TakkenBot', 'kriTakBot', 'robot',
    'AaaarghBot', 'CrumBot', 'WilemBot', 'SlateBot', 'TakticianBotDev', 'ManicBot',
    'CataklysmBot', 'FPABot'
  )
`).get();
console.log('Human-only games:', humanGames.t);

const botGames = db.prepare(`
  SELECT COUNT(*) as t FROM games 
  WHERE player_white IN (
    'CobbleBot', 'Tiltak_Bot', 'AlphaTakBot_5x5', 'VerekaiBot1', 'TakticianBot',
    'BeginnerBot', 'TakkerBot', 'BloodlessBot', 'takkybot', 'ShlktBot', 'IntuitionBot',
    'alphatak_bot', 'alphabot', 'TakkerusBot', 'TakkenBot', 'kriTakBot', 'robot',
    'AaaarghBot', 'CrumBot', 'WilemBot', 'SlateBot', 'TakticianBotDev', 'ManicBot',
    'CataklysmBot', 'FPABot'
  )
  OR player_black IN (
    'CobbleBot', 'Tiltak_Bot', 'AlphaTakBot_5x5', 'VerekaiBot1', 'TakticianBot',
    'BeginnerBot', 'TakkerBot', 'BloodlessBot', 'takkybot', 'ShlktBot', 'IntuitionBot',
    'alphatak_bot', 'alphabot', 'TakkerusBot', 'TakkenBot', 'kriTakBot', 'robot',
    'AaaarghBot', 'CrumBot', 'WilemBot', 'SlateBot', 'TakticianBotDev', 'ManicBot',
    'CataklysmBot', 'FPABot'
  )
`).get();
console.log('Bot games (old list):', botGames.t);

// Check with the new complete bot list
const allBots = [
  'AaaarghBot', 'AlphaTakBot_5x5', 'AltCobbleBot', 'BeginnerBot', 'BloodlessBot', 'Bot1',
  'BotheredFool', 'BottomBanana', 'Botz', 'CairnBot', 'CataklysmBot', 'CobbleBot', 'CrumBot',
  'Diegolibot', 'DoubleStackBot', 'ElBotanisto', 'FPABot', 'Fatrobot', 'FlashBot', 'FriendlyBot',
  'IntuitionBot', 'Kubote', 'ManicBot', 'Megabot10', 'Murderbot11', 'OiBotti', 'PizzaBot',
  'RoboticSlayer45', 'SamBot', 'SelfEsteemBot', 'ShlktBot', 'SlateBot', 'Srebotnjak', 'TakkenBot',
  'TakkerBot', 'TakkerusBot', 'TakticBot', 'Takticbot', 'TakticianBot', 'TakticianBotDev',
  'Tiltak_Bot', 'TopazBot', 'TrigeerBot', 'VerekaiBot1', 'WilemBot', 'ZachBot', 'alphabot',
  'alphatak_bot', 'alphatak_bot1', 'antakonistbot', 'bartlebot', 'borobotos', 'botimer',
  'botpopter', 'cutak_bot', 'ditakticBot', 'edubot', 'kriTakBot', 'liambot123', 'mankBot',
  'pablobotet', 'robot', 'roboticgazelle', 'roboticist', 'sTAKbot', 'sTAKbot1', 'sTAKbot2',
  'saibot', 'shamthebot', 'takkybot', 'xSENTIENTROBOTx', 'zacbot'
];

const placeholders = allBots.map(() => '?').join(',');
const newBotGames = db.prepare(`
  SELECT COUNT(*) as t FROM games 
  WHERE player_white IN (${placeholders})
  OR player_black IN (${placeholders})
`).get(...allBots, ...allBots);
console.log('Bot games (new 72-bot list):', newBotGames.t);

const humanOnlyFiltered = db.prepare(`
  SELECT COUNT(*) as t FROM games
  WHERE player_white NOT IN (${placeholders})
  AND player_black NOT IN (${placeholders})
`).get(...allBots, ...allBots);
console.log('Human-only games (with new 72-bot list):', humanOnlyFiltered.t);

db.close();
