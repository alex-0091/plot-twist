import { supabase, isSupabaseConfigured } from './supabaseClient';
import { GameState, Player, GameSettings } from '../types';
import { BOARD_SPACES } from '../types';
import { DEFAULT_GAME_SETTINGS } from '../types';

export class SupabaseGameSync {
  private static activeChannel: any = null;
  private static activeRoomCode: string | null = null;

  public static async createRoom(
    roomName: string,
    hostPlayer: Player,
    settings?: Partial<GameSettings>
  ): Promise<{ success: boolean; roomCode?: string; state?: GameState; error?: string }> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Multiplayer service is not configured' };
    }

    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const mergedSettings: GameSettings = { ...DEFAULT_GAME_SETTINGS, ...(settings || {}) };

    const initialProperties: Record<number, any> = {};
    BOARD_SPACES.forEach((space) => {
      if (['PROPERTY', 'TRANSPORT', 'UTILITY'].includes(space.type)) {
        initialProperties[space.index] = {
          spaceIndex: space.index,
          ownerId: null,
          houses: 0,
          hasHotel: false,
          isMortgaged: false,
        };
      }
    });

    const initialState: GameState = {
      roomCode,
      roomName,
      hostId: hostPlayer.id,
      status: 'LOBBY',
      settings: mergedSettings,
      players: [hostPlayer],
      currentPlayerIndex: 0,
      turnNumber: 1,
      consecutiveDoubles: 0,
      lastDice: [1, 1],
      diceRolled: false,
      hasMovedThisTurn: false,
      properties: initialProperties,
      availableHouses: mergedSettings.housesAvailable,
      availableHotels: mergedSettings.hotelsAvailable,
      freeParkingPot: 0,
      currentAuction: null,
      activeTrade: null,
      lastCardDrawn: null,
      winnerId: null,
      logs: [
        {
          id: `log_${Date.now()}`,
          timestamp: Date.now(),
          text: `Room "${roomName}" created by ${hostPlayer.name}. Welcome to PLOT TWIST 🇵🇰!`,
          type: 'CHAT',
        },
      ],
    };

    try {
      const { error } = await supabase.from('rooms').insert({
        room_code: roomCode,
        room_name: roomName,
        host_id: hostPlayer.id,
        status: 'LOBBY',
        game_state: initialState,
      });

      if (error) {
        console.error('Supabase create room error:', error);
        return { success: false, error: 'Could not create room. Please try again.' };
      }

      return { success: true, roomCode, state: initialState };
    } catch (e: any) {
      return { success: false, error: 'Network error creating game room' };
    }
  }

  public static async fetchRoomState(
    roomCode: string,
    retries = 3
  ): Promise<{ success: boolean; state?: GameState; error?: string }> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Multiplayer service is not configured' };
    }

    const code = roomCode.toUpperCase().trim();
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const { data, error } = await supabase
          .from('rooms')
          .select('*')
          .eq('room_code', code)
          .maybeSingle();

        if (data && data.game_state) {
          return { success: true, state: data.game_state as GameState };
        }

        if (attempt < retries - 1) {
          await new Promise((r) => setTimeout(r, 400));
        }
      } catch (e) {
        if (attempt === retries - 1) {
          return { success: false, error: 'Could not connect to room' };
        }
      }
    }
    return { success: false, error: 'Room not found. Please check your room code.' };
  }

  public static async joinRoom(
    roomCode: string,
    newPlayer: Player,
    existingPlayerId?: string | null
  ): Promise<{ success: boolean; state?: GameState; reclaimedPlayerId?: string; error?: string }> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Multiplayer service is not configured' };
    }

    const code = roomCode.toUpperCase().trim();
    const fetchRes = await this.fetchRoomState(code, 3);
    if (!fetchRes.success || !fetchRes.state) {
      return { success: false, error: fetchRes.error || 'Room not found' };
    }

    const state = fetchRes.state;

    // 1. Check for Reconnection / Existing Player Slot
    if (existingPlayerId) {
      const existingIdx = state.players.findIndex((p) => p.id === existingPlayerId);
      if (existingIdx !== -1) {
        state.players[existingIdx].connected = true;
        await this.updateGameState(code, state);
        return { success: true, state, reclaimedPlayerId: existingPlayerId };
      }
    }

    // Check by name if same nickname already in match
    const sameNameIdx = state.players.findIndex(
      (p) => p.name.trim().toLowerCase() === newPlayer.name.trim().toLowerCase()
    );
    if (sameNameIdx !== -1) {
      state.players[sameNameIdx].connected = true;
      await this.updateGameState(code, state);
      return { success: true, state, reclaimedPlayerId: state.players[sameNameIdx].id };
    }

    // 2. If room already started and not reconnecting
    if (state.status !== 'LOBBY') {
      return { success: false, error: 'This match is already in progress' };
    }

    // 3. Room full check
    if (state.players.length >= 8) {
      return { success: false, error: 'This room is full (maximum 8 players)' };
    }

    // 4. Add new player to room
    newPlayer.cash = state.settings.startingMoney;
    state.players.push(newPlayer);
    state.logs.push({
      id: `log_${Date.now()}`,
      timestamp: Date.now(),
      text: `${newPlayer.name} joined the room!`,
      type: 'CHAT',
    });

    await this.updateGameState(code, state);
    return { success: true, state, reclaimedPlayerId: newPlayer.id };
  }

  public static async updateGameState(roomCode: string, newState: GameState) {
    if (!isSupabaseConfigured || !supabase) return;

    try {
      // Host Failover check: If host is disconnected or left, transfer host privileges
      const hostExists = newState.players.some((p) => p.id === newState.hostId && p.connected);
      if (!hostExists && newState.players.length > 0) {
        const firstConnected = newState.players.find((p) => p.connected && !p.isBot);
        if (firstConnected) {
          newState.hostId = firstConnected.id;
          newState.logs.push({
            id: `log_${Date.now()}_host`,
            timestamp: Date.now(),
            text: `👑 Host privileges transferred to ${firstConnected.name}.`,
            type: 'CHAT',
          });
        }
      }

      await supabase
        .from('rooms')
        .update({
          status: newState.status,
          game_state: newState,
          updated_at: new Date().toISOString(),
        })
        .eq('room_code', roomCode.toUpperCase());
    } catch (e) {
      console.error('Failed to update Supabase game state:', e);
    }
  }

  public static subscribeToRoom(roomCode: string, onUpdate: (state: GameState) => void) {
    if (!isSupabaseConfigured || !supabase) return null;

    const code = roomCode.toUpperCase().trim();
    if (this.activeChannel && this.activeRoomCode === code) {
      return this.activeChannel;
    }

    this.unsubscribe();
    this.activeRoomCode = code;

    const channel = supabase
      .channel(`room_${code}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rooms',
          filter: `room_code=eq.${code}`,
        },
        (payload) => {
          if (payload.new && payload.new.game_state) {
            onUpdate(payload.new.game_state as GameState);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[Supabase Realtime] Subscribed to room ${code}`);
        }
      });

    this.activeChannel = channel;
    return channel;
  }

  public static unsubscribe() {
    if (this.activeChannel) {
      this.activeChannel.unsubscribe();
      this.activeChannel = null;
      this.activeRoomCode = null;
    }
  }
}
