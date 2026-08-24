const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kczsxllqnwcbxkccblrz.supabase.co';
const supabaseKey = 'sb_publishable_A9SBiFBD-cM5rHkgz-Z4jw__VYZxQ-G';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabase() {
  console.log('Testing live Supabase connection...');

  const testRoomCode = 'LIVE' + Math.floor(10 + Math.random() * 89);
  const testState = {
    roomCode: testRoomCode,
    roomName: 'Live Verification Room',
    hostId: 'p_test',
    status: 'LOBBY',
    settings: { startingMoney: 1500 },
    players: [{ id: 'p_test', name: 'Test Player', token: 'rickshaw', cash: 1500, position: 0 }],
    logs: [{ id: '1', text: 'Live test', type: 'CHAT' }],
  };

  const { data: insertData, error: insertError } = await supabase.from('rooms').insert({
    room_code: testRoomCode,
    room_name: 'Live Verification Room',
    host_id: 'p_test',
    status: 'LOBBY',
    game_state: testState,
  });

  if (insertError) {
    console.error('❌ Insert Error:', insertError);
    return;
  }
  console.log('✅ Room successfully inserted in Supabase database! Room Code:', testRoomCode);

  const { data: readData, error: readError } = await supabase
    .from('rooms')
    .select('*')
    .eq('room_code', testRoomCode)
    .single();

  if (readError) {
    console.error('❌ Read Error:', readError);
    return;
  }
  console.log('✅ Room successfully read from Supabase! Room Name:', readData.room_name);
}

testSupabase();
