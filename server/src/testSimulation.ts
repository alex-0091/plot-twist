import { GameRoom } from './engine/GameRoom.js';
import { Player } from '../../shared/types.js';
import { BOT_PERSONALITIES } from '../../shared/defaultSettings.js';

console.log('🧪 Starting PLOT TWIST Headless Game Simulation...');

const hostPlayer: Player = {
  id: 'p_test_host',
  socketId: 'sock_host',
  name: 'Owais (Host)',
  avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Owais',
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

const room = new GameRoom('TEST01', 'Test Plot Room', hostPlayer);

// Add 3 Bots
BOT_PERSONALITIES.slice(0, 3).forEach((botTemplate, i) => {
  const botPlayer: Player = {
    id: `bot_test_${i}`,
    socketId: `bot_sock_${i}`,
    name: botTemplate.name,
    avatar: botTemplate.avatar,
    token: botTemplate.token,
    tokenEmoji: botTemplate.tokenEmoji,
    color: '#D97706',
    cash: 1500,
    position: 0,
    properties: [],
    getOutOfJailCards: 0,
    inJail: false,
    jailTurns: 0,
    isBankrupt: false,
    isBot: true,
    botDifficulty: botTemplate.difficulty,
    botPersonality: botTemplate.name,
    connected: true,
  };
  room.addPlayer(botPlayer);
});

console.log(`✓ Room created with ${room.state.players.length} players`);

// Start Game
const startRes = room.startGame(hostPlayer.id);
console.log(`✓ Game started: ${startRes.success}`);

// Simulate 20 Turns
for (let turn = 1; turn <= 20; turn++) {
  const curPlayer = room.getCurrentPlayer();
  console.log(`\n--- Turn ${turn}: ${curPlayer.name} (Cash: Rs ${curPlayer.cash}, Pos: ${curPlayer.position}) ---`);

  // Roll
  const rollRes = room.rollDice(curPlayer.id);
  console.log(`  Rolled: [${rollRes.dice?.[0]}, ${rollRes.dice?.[1]}] -> Landed on space ${curPlayer.position}`);

  // If purchasable, buy
  const buyRes = room.buyProperty(curPlayer.id);
  if (buyRes.success) {
    console.log(`  Bought property on space ${curPlayer.position}!`);
  }

  // End turn
  room.endTurn(curPlayer.id);
}

console.log('\n🎉 Simulation Completed Successfully! Recent Game Logs:');
room.state.logs.slice(-6).forEach((log) => {
  console.log(`  • [${log.type}] ${log.text}`);
});
