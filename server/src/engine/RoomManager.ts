import { GameRoom } from './GameRoom.js';
import { Player, GameSettings } from '../../../shared/types.js';

export class RoomManager {
  private rooms: Map<string, GameRoom> = new Map();
  private socketToPlayerMap: Map<string, { roomCode: string; playerId: string }> = new Map();

  public createRoom(
    roomName: string,
    hostPlayer: Player,
    settings?: Partial<GameSettings>
  ): { roomCode: string; room: GameRoom } {
    let roomCode = this.generateRoomCode();
    while (this.rooms.has(roomCode)) {
      roomCode = this.generateRoomCode();
    }

    const room = new GameRoom(roomCode, roomName, hostPlayer, settings);
    this.rooms.set(roomCode, room);
    this.socketToPlayerMap.set(hostPlayer.socketId, { roomCode, playerId: hostPlayer.id });

    return { roomCode, room };
  }

  public getRoom(roomCode: string): GameRoom | undefined {
    return this.rooms.get(roomCode.toUpperCase());
  }

  public registerSocket(socketId: string, roomCode: string, playerId: string) {
    this.socketToPlayerMap.set(socketId, { roomCode: roomCode.toUpperCase(), playerId });
  }

  public getPlayerBySocket(socketId: string): { roomCode: string; playerId: string } | undefined {
    return this.socketToPlayerMap.get(socketId);
  }

  public removeSocket(socketId: string) {
    this.socketToPlayerMap.delete(socketId);
  }

  public deleteRoom(roomCode: string) {
    this.rooms.delete(roomCode.toUpperCase());
  }

  public getAllRooms(): { code: string; name: string; players: number; status: string }[] {
    const list: { code: string; name: string; players: number; status: string }[] = [];
    this.rooms.forEach((room, code) => {
      list.push({
        code,
        name: room.state.roomName,
        players: room.state.players.length,
        status: room.state.status,
      });
    });
    return list;
  }

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
