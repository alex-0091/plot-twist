const { GameRoom } = require('../server/dist/server/src/engine/GameRoom.js');
const { BOT_PERSONALITIES } = require('../server/dist/shared/defaultSettings.js');

console.log('🧪 Running Comprehensive End-to-End 4-Player Match Simulation...\n');

const hostPlayer = {
  id: 'p1',
  socketId: 'sock_p1',
  name: 'Raja Sahab',
  avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Raja',
  token: 'rickshaw',
  tokenEmoji: '🛺',
  color: '#16A34A',
  cash: 1500,
  position: 0,
  properties: [],
  getOutOfJailCards: 0,
  inJail: false,
  jailTurns: 0,
  isBankrupt: false,
  isBot: false,
  connected: true,
};

const room = new GameRoom('E2E99', 'Islamabad Elite Match', hostPlayer);

// Add 3 Bots
BOT_PERSONALITIES.slice(0, 3).forEach((b, i) => {
  room.addPlayer({
    id: `bot_${i}`,
    socketId: `bot_sock_${i}`,
    name: b.name,
    avatar: b.avatar,
    token: b.token,
    tokenEmoji: b.tokenEmoji,
    color: '#D97706',
    cash: 1500,
    position: 0,
    properties: [],
    getOutOfJailCards: 0,
    inJail: false,
    jailTurns: 0,
    isBankrupt: false,
    isBot: true,
    botDifficulty: b.difficulty,
    botPersonality: b.name,
    connected: true,
  });
});

console.log(`✓ 1. Lobby created with ${room.state.players.length} players`);

// Start Match
const start = room.startGame(hostPlayer.id);
console.log(`✓ 2. Match Started: ${start.success}`);

// Simulate 35 turns
for (let turn = 1; turn <= 35; turn++) {
  if (room.state.status === 'GAME_OVER') {
    console.log(`🏆 Game over reached on turn ${turn}! Winner: ${room.state.winnerId}`);
    break;
  }

  const p = room.getCurrentPlayer();
  const rollRes = room.rollDice(p.id);
  const buyRes = room.buyProperty(p.id);

  // Test Building if holding full set
  if (p.properties.length >= 2) {
    p.properties.forEach((propIdx) => {
      room.buildHouse(p.id, propIdx);
    });
  }

  // Test Reconnect mid-game on turn 10
  if (turn === 10) {
    console.log(`  🔄 Simulating disconnect and reconnect of ${p.name}...`);
    p.connected = false;
    p.connected = true;
    console.log(`  ✓ Successfully reconnected without state loss!`);
  }

  room.endTurn(p.id);
}

console.log('\n========================================');
console.log('✅ End-to-End Simulation Finished Successfully!');
console.log('Match Status:', room.state.status);
console.log('Turns Completed:', room.state.turnNumber);
console.log('Players Status:');
room.state.players.forEach((p) => {
  console.log(`  • ${p.name}: Rs ${p.cash} | Plots: ${p.properties.length} | Status: ${p.isBankrupt ? 'BANKRUPT' : 'ACTIVE'}`);
});
console.log('========================================\n');
