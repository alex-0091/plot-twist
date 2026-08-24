import { supabase, isSupabaseConfigured } from './supabaseClient';
import { GameState, Player, GameSettings } from '../types';
import { BOARD_SPACES } from '../types';
import { DEFAULT_GAME_SETTINGS } from '../types';

export class SupabaseGameSync {
  private static activeChannel: any = null;

  public static async createRoom(
    roomName: string,
    hostPlayer: Player,
    settings?: Partial<GameSettings>
  ): Promise<{ success: boolean; roomCode?: string; state?: GameState; error?: string }> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Supabase not configured' };
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
        return { success: false, error: error.message };
      }

      return { success: true, roomCode, state: initialState };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  public static async joinRoom(
    roomCode: string,
    newPlayer: Player
  ): Promise<{ success: boolean; state?: GameState; error?: string }> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_code', roomCode.toUpperCase())
        .single();

      if (error || !data) {
        return { success: false, error: 'Room not found. Check the room code.' };
      }

      const state = data.game_state as GameState;
      if (state.status !== 'LOBBY') {
        // Check if player is reconnecting
        const existingIdx = state.players.findIndex((p) => p.id === newPlayer.id || p.name === newPlayer.name);
        if (existingIdx !== -1) {
          state.players[existingIdx].connected = true;
          return { success: true, state };
        }
        return { success: false, error: 'Game already in progress' };
      }

      if (state.players.length >= 8) {
        return { success: false, error: 'Room is full (max 8)' };
      }

      // Add player
      newPlayer.cash = state.settings.startingMoney;
      state.players.push(newPlayer);
      state.logs.push({
        id: `log_${Date.now()}`,
        timestamp: Date.now(),
        text: `${newPlayer.name} joined the room!`,
        type: 'CHAT',
      });

      await this.updateGameState(roomCode, state);

      return { success: true, state };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  public static async updateGameState(roomCode: string, newState: GameState) {
    if (!isSupabaseConfigured || !supabase) return;

    try {
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

    if (this.activeChannel) {
      this.activeChannel.unsubscribe();
    }

    const channel = supabase
      .channel(`room_${roomCode.toUpperCase()}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rooms',
          filter: `room_code=eq.${roomCode.toUpperCase()}`,
        },
        (payload) => {
          if (payload.new && payload.new.game_state) {
            onUpdate(payload.new.game_state as GameState);
          }
        }
      )
      .subscribe();

    this.activeChannel = channel;
    return channel;
  }

  public static unsubscribe() {
    if (this.activeChannel) {
      this.activeChannel.unsubscribe();
      this.activeChannel = null;
    }
  }
}
