const { CardEngine } = require('../server/dist/server/src/engine/CardEngine.js');
const { ALL_CARDS } = require('../server/dist/shared/cardsData.js');

console.log('🧪 Running Test Suite for all 29 Pakistani Cards...\n');

const cardEngine = new CardEngine();

const testPlayers = [
  { id: 'p1', name: 'Owais', cash: 1500, properties: [1, 3], position: 0, getOutOfJailCards: 0, inJail: false, jailTurns: 0, isBankrupt: false },
  { id: 'p2', name: 'Hamza', cash: 1500, properties: [6, 8], position: 0, getOutOfJailCards: 0, inJail: false, jailTurns: 0, isBankrupt: false },
  { id: 'p3', name: 'Sana', cash: 1500, properties: [], position: 0, getOutOfJailCards: 0, inJail: false, jailTurns: 0, isBankrupt: false },
];

const testProperties = {
  1: { spaceIndex: 1, ownerId: 'p1', houses: 2, hasHotel: false, isMortgaged: false },
  3: { spaceIndex: 3, ownerId: 'p1', houses: 0, hasHotel: true, isMortgaged: false },
  6: { spaceIndex: 6, ownerId: 'p2', houses: 0, hasHotel: false, isMortgaged: false },
  8: { spaceIndex: 8, ownerId: 'p2', houses: 0, hasHotel: false, isMortgaged: false },
};

let passed = 0;
let failed = 0;

ALL_CARDS.forEach((card) => {
  try {
    const res = cardEngine.executeCard(card, testPlayers[0], testPlayers, testProperties, 200);
    if (!res || !res.logMessage) {
      throw new Error('Missing result logMessage');
    }
    console.log(`✓ Card #${card.id} [${card.deck}] "${card.title}": OK -> ${res.logMessage.substring(0, 70)}...`);
    passed++;
  } catch (err) {
    console.error(`❌ Card #${card.id} "${card.title}" Failed:`, err);
    failed++;
  }
});

console.log(`\n========================================`);
console.log(`Cards Test Suite: ${passed}/${ALL_CARDS.length} PASSED (Failed: ${failed})`);
console.log(`========================================\n`);

if (failed > 0) process.exit(1);
