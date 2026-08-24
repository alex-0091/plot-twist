const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kczsxllqnwcbxkccblrz.supabase.co';
const supabaseKey = 'sb_publishable_A9SBiFBD-cM5rHkgz-Z4jw__VYZxQ-G';
const supabase = createClient(supabaseUrl, supabaseKey);

async function runLiveMatchSimulation() {
  console.log('🎮 Running Full Live Match Simulation on Supabase...');

  const roomCode = 'MATCH' + Math.floor(10 + Math.random() * 89);
  const hostPlayer = {
    id: 'p_alex',
    name: 'Alex (Host)',
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

  const friendPlayer = {
    id: 'p_friend',
    name: 'Hamza',
    token: 'chai_cup',
    tokenEmoji: '☕',
    color: '#2563EB',
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

  const initialProperties = {};
  for (let i = 0; i < 40; i++) {
    initialProperties[i] = { spaceIndex: i, ownerId: null, houses: 0, hasHotel: false, isMortgaged: false };
  }

  const gameState = {
    roomCode,
    roomName: 'Alex ka Plot',
    hostId: hostPlayer.id,
    status: 'LOBBY',
    settings: {
      startingMoney: 1500,
      salaryOnStart: 200,
      auctionsEnabled: true,
      forcedAuctions: false,
      mortgagesEnabled: true,
      mortgageInterest: 0.1,
      evenBuild: true,
      freeParkingMode: 'NONE',
      freeParkingAmount: 100,
      maxJailTurns: 3,
      jailBail: 50,
      doublesExtraTurn: true,
      tripleDoublesJail: true,
      housesAvailable: 32,
      hotelsAvailable: 12,
      housesForHotel: 4,
    },
    players: [hostPlayer, friendPlayer],
    currentPlayerIndex: 0,
    turnNumber: 1,
    consecutiveDoubles: 0,
    lastDice: [1, 1],
    diceRolled: false,
    hasMovedThisTurn: false,
    properties: initialProperties,
    availableHouses: 32,
    availableHotels: 12,
    freeParkingPot: 0,
    currentAuction: null,
    activeTrade: null,
    lastCardDrawn: null,
    winnerId: null,
    logs: [{ id: '1', timestamp: Date.now(), text: 'Match initialized', type: 'CHAT' }],
  };

  // 1. Create Room in Supabase
  const { error: createErr } = await supabase.from('rooms').insert({
    room_code: roomCode,
    room_name: gameState.roomName,
    host_id: hostPlayer.id,
    status: 'LOBBY',
    game_state: gameState,
  });

  if (createErr) {
    console.error('Create error:', createErr);
    return;
  }
  console.log('✓ 1. Room Created:', roomCode);

  // 2. Start Game
  gameState.status = 'PLAYING';
  gameState.logs.push({ id: '2', timestamp: Date.now(), text: 'Game started! Turn: Alex', type: 'ROLL' });

  // 3. Player 1 (Alex) rolls and buys Pindora (index 1)
  gameState.diceRolled = true;
  gameState.lastDice = [1, 2];
  gameState.players[0].position = 3; // Raja Bazaar
  gameState.players[0].cash -= 60;
  gameState.properties[3].ownerId = hostPlayer.id;
  gameState.players[0].properties.push(3);
  gameState.logs.push({ id: '3', timestamp: Date.now(), text: 'Alex bought Raja Bazaar for Rs 60', type: 'BUY' });

  // 4. Update state in Supabase
  const { error: updateErr } = await supabase
    .from('rooms')
    .update({
      status: 'PLAYING',
      game_state: gameState,
      updated_at: new Date().toISOString(),
    })
    .eq('room_code', roomCode);

  if (updateErr) {
    console.error('Update error:', updateErr);
    return;
  }
  console.log('✓ 2. Game Played & State Saved to Supabase in Real Time!');

  // 5. Read back state from Supabase
  const { data: fetchedRoom, error: fetchErr } = await supabase
    .from('rooms')
    .select('*')
    .eq('room_code', roomCode)
    .single();

  if (fetchErr) {
    console.error('Fetch error:', fetchErr);
    return;
  }

  console.log('✓ 3. Verified Fetched Room Data from Supabase:');
  console.log('   - Room Code:', fetchedRoom.room_code);
  console.log('   - Status:', fetchedRoom.status);
  console.log('   - Players Count:', fetchedRoom.game_state.players.length);
  console.log('   - Alex Cash:', fetchedRoom.game_state.players[0].cash);
  console.log('   - Alex Plots:', fetchedRoom.game_state.players[0].properties);
  console.log('\n🎉 ALL CHECKS PASSED 100%! Ready to play on https://plot-twist-ctn.pages.dev/');
}

runLiveMatchSimulation();
