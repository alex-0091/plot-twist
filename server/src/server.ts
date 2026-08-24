import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { RoomManager } from './engine/RoomManager.js';
import { Player } from '../../shared/types.js';
import { BOT_PERSONALITIES } from '../../shared/defaultSettings.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const roomManager = new RoomManager();

// Health check and public rooms list endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), name: 'PLOT TWIST Server' });
});

app.get('/api/rooms', (req, res) => {
  res.json({ rooms: roomManager.getAllRooms() });
});

io.on('connection', (socket: Socket) => {
  console.log(`[Socket] Connected: ${socket.id}`);

  // 1. Create Room
  socket.on('create_room', (data: { roomName: string; playerName: string; avatar: string; token: string; tokenEmoji: string; settings?: any }, callback) => {
    try {
      const hostPlayer: Player = {
        id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        socketId: socket.id,
        name: data.playerName || 'Host Player',
        avatar: data.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Host',
        token: data.token || 'rickshaw',
        tokenEmoji: data.tokenEmoji || '🛺',
        color: '#16A34A',
        cash: data.settings?.startingMoney || 1500,
        position: 0,
        properties: [],
        getOutOfJailCards: 0,
        inJail: false,
        jailTurns: 0,
        isBankrupt: false,
        isBot: false,
        connected: true,
      };

      const { roomCode, room } = roomManager.createRoom(data.roomName || 'Owais ka Plot', hostPlayer, data.settings);
      socket.join(roomCode);

      room.setOnStateChange((updatedState) => {
        io.to(roomCode).emit('game_state_update', updatedState);
      });

      console.log(`[Room Created] ${roomCode} by ${hostPlayer.name}`);
      callback?.({ success: true, roomCode, playerId: hostPlayer.id, state: room.state });
    } catch (e: any) {
      console.error('Error creating room:', e);
      callback?.({ success: false, error: e.message });
    }
  });

  // 2. Join Room
  socket.on('join_room', (data: { roomCode: string; playerName: string; avatar: string; token: string; tokenEmoji: string }, callback) => {
    try {
      const code = data.roomCode?.toUpperCase();
      const room = roomManager.getRoom(code);
      if (!room) {
        return callback?.({ success: false, error: 'Room code not found' });
      }

      const newPlayer: Player = {
        id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        socketId: socket.id,
        name: data.playerName || `Player ${room.state.players.length + 1}`,
        avatar: data.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${data.playerName}`,
        token: data.token || 'chai_cup',
        tokenEmoji: data.tokenEmoji || '☕',
        color: '#2563EB',
        cash: room.state.settings.startingMoney,
        position: 0,
        properties: [],
        getOutOfJailCards: 0,
        inJail: false,
        jailTurns: 0,
        isBankrupt: false,
        isBot: false,
        connected: true,
      };

      const res = room.addPlayer(newPlayer);
      if (!res.success) {
        return callback?.(res);
      }

      roomManager.registerSocket(socket.id, code, newPlayer.id);
      socket.join(code);

      console.log(`[Player Joined] ${newPlayer.name} joined room ${code}`);
      callback?.({ success: true, roomCode: code, playerId: newPlayer.id, state: room.state });
    } catch (e: any) {
      callback?.({ success: false, error: e.message });
    }
  });

  // 3. Add AI Bot
  socket.on('add_bot', (data: { roomCode: string; botIndex?: number }, callback) => {
    const room = roomManager.getRoom(data.roomCode);
    if (!room) return callback?.({ success: false, error: 'Room not found' });
    if (room.state.status !== 'LOBBY') return callback?.({ success: false, error: 'Cannot add bot after game start' });
    if (room.state.players.length >= 8) return callback?.({ success: false, error: 'Room is full (max 8)' });

    const existingBotCount = room.state.players.filter((p) => p.isBot).length;
    const botTemplate = BOT_PERSONALITIES[existingBotCount % BOT_PERSONALITIES.length];

    const botPlayer: Player = {
      id: `bot_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      socketId: `bot_sock_${Date.now()}`,
      name: botTemplate.name,
      avatar: botTemplate.avatar,
      token: botTemplate.token,
      tokenEmoji: botTemplate.tokenEmoji,
      color: '#D97706',
      cash: room.state.settings.startingMoney,
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

    const res = room.addPlayer(botPlayer);
    callback?.(res);
  });

  // 4. Remove Bot
  socket.on('remove_bot', (data: { roomCode: string; botId: string }, callback) => {
    const room = roomManager.getRoom(data.roomCode);
    if (!room) return callback?.({ success: false });
    room.removePlayer(data.botId);
    callback?.({ success: true });
  });

  // 5. Update Host Settings
  socket.on('update_settings', (data: { roomCode: string; playerId: string; settings: any }, callback) => {
    const room = roomManager.getRoom(data.roomCode);
    if (!room) return callback?.({ success: false });
    const ok = room.updateSettings(data.playerId, data.settings);
    callback?.({ success: ok });
  });

  // 6. Start Game
  socket.on('start_game', (data: { roomCode: string; playerId: string }, callback) => {
    const room = roomManager.getRoom(data.roomCode);
    if (!room) return callback?.({ success: false, error: 'Room not found' });
    const res = room.startGame(data.playerId);
    callback?.(res);
  });

  // 7. Roll Dice
  socket.on('roll_dice', (data: { roomCode: string; playerId: string }, callback) => {
    const room = roomManager.getRoom(data.roomCode);
    if (!room) return callback?.({ success: false, error: 'Room not found' });
    const res = room.rollDice(data.playerId);
    callback?.(res);
  });

  // 8. Buy Property
  socket.on('buy_property', (data: { roomCode: string; playerId: string }, callback) => {
    const room = roomManager.getRoom(data.roomCode);
    if (!room) return callback?.({ success: false });
    const res = room.buyProperty(data.playerId);
    callback?.(res);
  });

  // 9. Decline Buy (Auction triggers)
  socket.on('decline_buy', (data: { roomCode: string; playerId: string }, callback) => {
    const room = roomManager.getRoom(data.roomCode);
    if (!room) return callback?.({ success: false });
    const res = room.declineBuyProperty(data.playerId);
    callback?.(res);
  });

  // 10. Build House / Hotel
  socket.on('build_house', (data: { roomCode: string; playerId: string; spaceIndex: number }, callback) => {
    const room = roomManager.getRoom(data.roomCode);
    if (!room) return callback?.({ success: false });
    const res = room.buildHouse(data.playerId, data.spaceIndex);
    callback?.(res);
  });

  // 11. Mortgage Property
  socket.on('mortgage_property', (data: { roomCode: string; playerId: string; spaceIndex: number }, callback) => {
    const room = roomManager.getRoom(data.roomCode);
    if (!room) return callback?.({ success: false });
    const res = room.mortgageProperty(data.playerId, data.spaceIndex);
    callback?.(res);
  });

  // 12. Unmortgage Property
  socket.on('unmortgage_property', (data: { roomCode: string; playerId: string; spaceIndex: number }, callback) => {
    const room = roomManager.getRoom(data.roomCode);
    if (!room) return callback?.({ success: false });
    const res = room.unmortgageProperty(data.playerId, data.spaceIndex);
    callback?.(res);
  });

  // 13. Pay Jail Bail
  socket.on('pay_bail', (data: { roomCode: string; playerId: string }, callback) => {
    const room = roomManager.getRoom(data.roomCode);
    if (!room) return callback?.({ success: false });
    const res = room.payBail(data.playerId);
    callback?.(res);
  });

  // 14. Use Jail Card
  socket.on('use_jail_card', (data: { roomCode: string; playerId: string }, callback) => {
    const room = roomManager.getRoom(data.roomCode);
    if (!room) return callback?.({ success: false });
    const res = room.useJailCard(data.playerId);
    callback?.(res);
  });

  // 15. End Turn
  socket.on('end_turn', (data: { roomCode: string; playerId: string }, callback) => {
    const room = roomManager.getRoom(data.roomCode);
    if (!room) return callback?.({ success: false });
    const res = room.endTurn(data.playerId);
    callback?.(res);
  });

  // 16. Auction Bidding
  socket.on('place_auction_bid', (data: { roomCode: string; playerId: string; amount: number }, callback) => {
    const room = roomManager.getRoom(data.roomCode);
    if (!room) return callback?.({ success: false });
    const res = room.placeAuctionBid(data.playerId, data.amount);
    callback?.(res);
  });

  socket.on('fold_auction', (data: { roomCode: string; playerId: string }, callback) => {
    const room = roomManager.getRoom(data.roomCode);
    if (!room) return callback?.({ success: false });
    const res = room.foldAuction(data.playerId);
    callback?.(res);
  });

  // 17. Trade Actions
  socket.on('create_trade_offer', (data: { roomCode: string; fromPlayerId: string; toPlayerId: string; offeredCash: number; offeredProperties: number[]; offeredJailCards: number; requestedCash: number; requestedProperties: number[]; requestedJailCards: number }, callback) => {
    const room = roomManager.getRoom(data.roomCode);
    if (!room) return callback?.({ success: false, error: 'Room not found' });
    const fromP = room.state.players.find((p) => p.id === data.fromPlayerId);
    const toP = room.state.players.find((p) => p.id === data.toPlayerId);
    if (!fromP || !toP) return callback?.({ success: false, error: 'Players not found' });

    const res = room.tradeEngine.createOffer(
      fromP,
      toP,
      data.offeredCash,
      data.offeredProperties,
      data.offeredJailCards,
      data.requestedCash,
      data.requestedProperties,
      data.requestedJailCards,
      room.state.properties
    );
    if (res.success && res.offer) {
      room.state.activeTrade = res.offer;
      room.addLog(`🤝 Trade offer proposed between ${fromP.name} and ${toP.name}!`, 'TRADE');
      io.to(data.roomCode).emit('game_state_update', room.state);
      callback?.({ success: true, offer: res.offer });
    } else {
      callback?.(res);
    }
  });

  socket.on('respond_trade', (data: { roomCode: string; offerId: string; accept: boolean }, callback) => {
    const room = roomManager.getRoom(data.roomCode);
    if (!room) return callback?.({ success: false });
    const offer = room.tradeEngine.getOffer(data.offerId);
    if (!offer) return callback?.({ success: false, error: 'Offer expired' });

    const fromP = room.state.players.find((p) => p.id === offer.fromPlayerId);
    const toP = room.state.players.find((p) => p.id === offer.toPlayerId);

    if (data.accept && fromP && toP) {
      const res = room.tradeEngine.executeTrade(data.offerId, fromP, toP, room.state.properties);
      if (res.success) {
        room.state.activeTrade = null;
        room.addLog(`🤝 Trade successfully completed between ${fromP.name} and ${toP.name}!`, 'TRADE');
        io.to(data.roomCode).emit('game_state_update', room.state);
        callback?.({ success: true });
      } else {
        callback?.(res);
      }
    } else {
      room.tradeEngine.cancelOffer(data.offerId);
      room.state.activeTrade = null;
      room.addLog(`❌ Trade declined/cancelled.`, 'TRADE');
      io.to(data.roomCode).emit('game_state_update', room.state);
      callback?.({ success: true });
    }
  });

  // 18. Chat
  socket.on('send_chat', (data: { roomCode: string; playerId: string; message: string }) => {
    const room = roomManager.getRoom(data.roomCode);
    if (!room) return;
    const player = room.state.players.find((p) => p.id === data.playerId);
    if (!player) return;
    room.addLog(`${player.name}: ${data.message}`, 'CHAT', player.id);
    io.to(data.roomCode).emit('game_state_update', room.state);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`[Socket] Disconnected: ${socket.id}`);
    const mapping = roomManager.getPlayerBySocket(socket.id);
    if (mapping) {
      const room = roomManager.getRoom(mapping.roomCode);
      if (room) {
        const player = room.state.players.find((p) => p.id === mapping.playerId);
        if (player) {
          player.connected = false;
          if (room.state.status === 'LOBBY') {
            room.removePlayer(player.id);
          }
        }
      }
      roomManager.removeSocket(socket.id);
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`🇵🇰 PLOT TWIST Server listening on http://localhost:${PORT}`);
});
