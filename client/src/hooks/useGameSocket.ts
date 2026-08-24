import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState, Player, GameSettings, Card, TradeOffer, AuctionState } from '../types';
import { sounds } from '../audio/SoundEffects';
import { isSupabaseConfigured } from '../services/supabaseClient';
import { SupabaseGameSync } from '../services/supabaseGameSync';
import { BOARD_SPACES, CITY_GROUP_MEMBERS, TRANSPORT_SPACES, UTILITY_SPACES } from '../types';
import { BOT_PERSONALITIES } from '../types';
import { ALL_CARDS } from '../types';

const SOCKET_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export function useGameSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(() => {
    return localStorage.getItem('pt_player_id') || null;
  });
  const [selectedPropertyIndex, setSelectedPropertyIndex] = useState<number | null>(null);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [tradeTargetPlayer, setTradeTargetPlayer] = useState<Player | null>(null);
  const [activeCardPopup, setActiveCardPopup] = useState<Card | null>(null);

  const prevTurnRef = useRef<number>(1);
  const prevLogsCountRef = useRef<number>(0);
  const gameStateRef = useRef<GameState | null>(null);
  gameStateRef.current = gameState;

  // Sound & Card popup trigger effect
  const handleStateChange = useCallback((newState: GameState) => {
    setGameState((prevState) => {
      if (newState.lastCardDrawn && (!prevState || prevState.lastCardDrawn?.id !== newState.lastCardDrawn.id)) {
        setActiveCardPopup(newState.lastCardDrawn);
        sounds.playCardSwoosh();
      }

      if (newState.turnNumber !== prevTurnRef.current) {
        prevTurnRef.current = newState.turnNumber;
      }

      if (newState.logs.length > prevLogsCountRef.current) {
        const lastLog = newState.logs[newState.logs.length - 1];
        if (lastLog) {
          if (lastLog.type === 'ROLL') sounds.playDiceRoll();
          else if (lastLog.type === 'BUY' || lastLog.type === 'RENT') sounds.playCash();
          else if (lastLog.type === 'JAIL') sounds.playJailSlam();
        }
        prevLogsCountRef.current = newState.logs.length;
      }

      if (newState.status === 'GAME_OVER' && prevState?.status !== 'GAME_OVER') {
        sounds.playVictory();
      }

      return newState;
    });
  }, []);

  // Sync state helper for Supabase mode
  const syncState = useCallback((updater: (current: GameState) => GameState) => {
    if (!gameStateRef.current) return;
    const nextState = updater(JSON.parse(JSON.stringify(gameStateRef.current)));
    handleStateChange(nextState);
    if (isSupabaseConfigured) {
      SupabaseGameSync.updateGameState(nextState.roomCode, nextState);
    }
  }, [handleStateChange]);

  useEffect(() => {
    if (isSupabaseConfigured) {
      setConnected(true);
      return;
    }

    const s = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    s.on('connect', () => {
      console.log('Connected to PLOT TWIST local server:', s.id);
      setConnected(true);
    });

    s.on('disconnect', () => {
      setConnected(false);
    });

    s.on('game_state_update', (newState: GameState) => {
      handleStateChange(newState);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [handleStateChange]);

  const createRoom = useCallback(
    async (roomName: string, playerName: string, avatar: string, token: string, tokenEmoji: string, settings?: Partial<GameSettings>): Promise<boolean> => {
      const pId = `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const hostPlayer: Player = {
        id: pId,
        socketId: socket?.id || `sock_${pId}`,
        name: playerName || 'Host Player',
        avatar,
        token,
        tokenEmoji,
        color: '#16A34A',
        cash: settings?.startingMoney || 1500,
        position: 0,
        properties: [],
        getOutOfJailCards: 0,
        inJail: false,
        jailTurns: 0,
        isBankrupt: false,
        isBot: false,
        connected: true,
      };

      if (isSupabaseConfigured) {
        const res = await SupabaseGameSync.createRoom(roomName, hostPlayer, settings);
        if (res.success && res.roomCode && res.state) {
          setMyPlayerId(pId);
          localStorage.setItem('pt_player_id', pId);
          handleStateChange(res.state);
          SupabaseGameSync.subscribeToRoom(res.roomCode, handleStateChange);
          return true;
        } else {
          alert(res.error || 'Failed to create room in Supabase');
          return false;
        }
      }

      return new Promise((resolve) => {
        if (!socket) return resolve(false);
        socket.emit('create_room', { roomName, playerName, avatar, token, tokenEmoji, settings }, (res: any) => {
          if (res?.success) {
            setMyPlayerId(res.playerId);
            localStorage.setItem('pt_player_id', res.playerId);
            handleStateChange(res.state);
            resolve(true);
          } else {
            alert(res?.error || 'Failed to create room');
            resolve(false);
          }
        });
      });
    },
    [socket, handleStateChange]
  );

  const joinRoom = useCallback(
    async (roomCode: string, playerName: string, avatar: string, token: string, tokenEmoji: string): Promise<boolean> => {
      const pId = `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newPlayer: Player = {
        id: pId,
        socketId: socket?.id || `sock_${pId}`,
        name: playerName,
        avatar,
        token,
        tokenEmoji,
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

      if (isSupabaseConfigured) {
        const res = await SupabaseGameSync.joinRoom(roomCode, newPlayer);
        if (res.success && res.state) {
          setMyPlayerId(pId);
          localStorage.setItem('pt_player_id', pId);
          handleStateChange(res.state);
          SupabaseGameSync.subscribeToRoom(roomCode, handleStateChange);
          return true;
        } else {
          alert(res.error || 'Room not found');
          return false;
        }
      }

      return new Promise((resolve) => {
        if (!socket) return resolve(false);
        socket.emit('join_room', { roomCode, playerName, avatar, token, tokenEmoji }, (res: any) => {
          if (res?.success) {
            setMyPlayerId(res.playerId);
            localStorage.setItem('pt_player_id', res.playerId);
            handleStateChange(res.state);
            resolve(true);
          } else {
            alert(res?.error || 'Failed to join room');
            resolve(false);
          }
        });
      });
    },
    [socket, handleStateChange]
  );

  const addBot = useCallback(() => {
    if (!gameState) return;
    if (socket && !isSupabaseConfigured) {
      socket.emit('add_bot', { roomCode: gameState.roomCode });
      return;
    }

    syncState((state) => {
      const existingBotCount = state.players.filter((p) => p.isBot).length;
      const botTemplate = BOT_PERSONALITIES[existingBotCount % BOT_PERSONALITIES.length];
      const botPlayer: Player = {
        id: `bot_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        socketId: `bot_sock_${Date.now()}`,
        name: botTemplate.name,
        avatar: botTemplate.avatar,
        token: botTemplate.token,
        tokenEmoji: botTemplate.tokenEmoji,
        color: '#D97706',
        cash: state.settings.startingMoney,
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
      state.players.push(botPlayer);
      state.logs.push({
        id: `log_${Date.now()}`,
        timestamp: Date.now(),
        text: `${botPlayer.name} joined the room!`,
        type: 'CHAT',
      });
      return state;
    });
  }, [gameState, socket, syncState]);

  const removeBot = useCallback(
    (botId: string) => {
      if (!gameState) return;
      if (socket && !isSupabaseConfigured) {
        socket.emit('remove_bot', { roomCode: gameState.roomCode, botId });
        return;
      }
      syncState((state) => {
        state.players = state.players.filter((p) => p.id !== botId);
        return state;
      });
    },
    [gameState, socket, syncState]
  );

  const updateSettings = useCallback(
    (settings: Partial<GameSettings>) => {
      if (!gameState || !myPlayerId) return;
      if (socket && !isSupabaseConfigured) {
        socket.emit('update_settings', { roomCode: gameState.roomCode, playerId: myPlayerId, settings });
        return;
      }
      syncState((state) => {
        state.settings = { ...state.settings, ...settings };
        state.players.forEach((p) => (p.cash = state.settings.startingMoney));
        return state;
      });
    },
    [gameState, myPlayerId, socket, syncState]
  );

  const startGame = useCallback(() => {
    if (!gameState || !myPlayerId) return;
    if (socket && !isSupabaseConfigured) {
      socket.emit('start_game', { roomCode: gameState.roomCode, playerId: myPlayerId });
      return;
    }
    syncState((state) => {
      state.status = 'PLAYING';
      state.currentPlayerIndex = 0;
      state.turnNumber = 1;
      state.diceRolled = false;
      state.hasMovedThisTurn = false;
      const firstP = state.players[0];
      state.logs.push({
        id: `log_${Date.now()}`,
        timestamp: Date.now(),
        text: `🎲 Game started! First turn: ${firstP.name}. Bismillah!`,
        type: 'ROLL',
      });
      return state;
    });
  }, [gameState, myPlayerId, socket, syncState]);

  const rollDice = useCallback(() => {
    if (!gameState || !myPlayerId) return;
    sounds.playDiceRoll();
    if (socket && !isSupabaseConfigured) {
      socket.emit('roll_dice', { roomCode: gameState.roomCode, playerId: myPlayerId });
      return;
    }

    syncState((state) => {
      const curP = state.players[state.currentPlayerIndex];
      if (curP.id !== myPlayerId || state.diceRolled) return state;

      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      state.lastDice = [d1, d2];
      state.diceRolled = true;
      const total = d1 + d2;
      const isDouble = d1 === d2;

      state.logs.push({
        id: `log_${Date.now()}`,
        timestamp: Date.now(),
        text: `🎲 ${curP.name} rolled [${d1}, ${d2}] = ${total}${isDouble ? ' (DOUBLES!)' : ''}`,
        type: 'ROLL',
      });

      // Jail Check
      if (curP.inJail) {
        if (isDouble) {
          curP.inJail = false;
          curP.jailTurns = 0;
          const oldPos = curP.position;
          curP.position = (oldPos + total) % 40;
          state.hasMovedThisTurn = true;
        } else {
          curP.jailTurns += 1;
          state.hasMovedThisTurn = true;
        }
        return state;
      }

      // Normal movement
      const oldPos = curP.position;
      const newPos = (oldPos + total) % 40;
      curP.position = newPos;
      state.hasMovedThisTurn = true;

      // Salary on START
      if (newPos < oldPos && oldPos !== 0) {
        curP.cash += state.settings.salaryOnStart;
        state.logs.push({
          id: `log_${Date.now()}_sal`,
          timestamp: Date.now(),
          text: `💵 ${curP.name} passed SALARY AA GAYI and collected Rs ${state.settings.salaryOnStart}!`,
          type: 'MOVE',
          urduFlavor: 'تنخواہ آ گئی!',
        });
      }

      const sp = BOARD_SPACES[newPos];
      // Rent check
      if (['PROPERTY', 'TRANSPORT', 'UTILITY'].includes(sp.type)) {
        const ps = state.properties[sp.index];
        if (ps && ps.ownerId && ps.ownerId !== curP.id && !ps.isMortgaged) {
          const owner = state.players.find((p) => p.id === ps.ownerId);
          if (owner && !owner.isBankrupt) {
            const rent = sp.rent || 15;
            curP.cash -= rent;
            owner.cash += rent;
            state.logs.push({
              id: `log_${Date.now()}_rent`,
              timestamp: Date.now(),
              text: `💸 ${curP.name} paid Rs ${rent} rent to ${owner.name} for ${sp.name}!`,
              type: 'RENT',
            });
          }
        }
      } else if (sp.type === 'GO_TO_JAIL') {
        curP.position = 10;
        curP.inJail = true;
        curP.jailTurns = 0;
        state.logs.push({
          id: `log_${Date.now()}_jail`,
          timestamp: Date.now(),
          text: `🚔 ${curP.name} met a Lahori and went straight to THANA!`,
          type: 'JAIL',
        });
      } else if (sp.type === 'TAX') {
        const tax = sp.taxAmount || 100;
        curP.cash -= tax;
        state.logs.push({
          id: `log_${Date.now()}_tax`,
          timestamp: Date.now(),
          text: `📋 ${curP.name} paid Rs ${tax} tax (${sp.name})!`,
          type: 'RENT',
        });
      }

      return state;
    });
  }, [gameState, myPlayerId, socket, syncState]);

  const buyProperty = useCallback(() => {
    if (!gameState || !myPlayerId) return;
    sounds.playCash();
    if (socket && !isSupabaseConfigured) {
      socket.emit('buy_property', { roomCode: gameState.roomCode, playerId: myPlayerId });
      return;
    }
    syncState((state) => {
      const curP = state.players[state.currentPlayerIndex];
      const sp = BOARD_SPACES[curP.position];
      const ps = state.properties[sp.index];
      const price = sp.price || 100;
      if (ps && !ps.ownerId && curP.cash >= price) {
        curP.cash -= price;
        ps.ownerId = curP.id;
        curP.properties.push(sp.index);
        state.logs.push({
          id: `log_${Date.now()}`,
          timestamp: Date.now(),
          text: `🏠 ${curP.name} bought ${sp.name} for Rs ${price}! Registry done!`,
          type: 'BUY',
          urduFlavor: 'مبارک ہو!',
        });
      }
      return state;
    });
  }, [gameState, myPlayerId, socket, syncState]);

  const declineBuy = useCallback(() => {
    if (!gameState || !myPlayerId) return;
    if (socket && !isSupabaseConfigured) {
      socket.emit('decline_buy', { roomCode: gameState.roomCode, playerId: myPlayerId });
      return;
    }
    syncState((state) => {
      const curP = state.players[state.currentPlayerIndex];
      const sp = BOARD_SPACES[curP.position];
      state.logs.push({
        id: `log_${Date.now()}`,
        timestamp: Date.now(),
        text: `${curP.name} declined to buy ${sp.name}.`,
        type: 'BUY',
      });
      return state;
    });
  }, [gameState, myPlayerId, socket, syncState]);

  const buildHouse = useCallback(
    (spaceIndex: number) => {
      if (!gameState || !myPlayerId) return;
      sounds.playCash();
      if (socket && !isSupabaseConfigured) {
        socket.emit('build_house', { roomCode: gameState.roomCode, playerId: myPlayerId, spaceIndex });
        return;
      }
      syncState((state) => {
        const p = state.players.find((pl) => pl.id === myPlayerId);
        const sp = BOARD_SPACES[spaceIndex];
        const ps = state.properties[spaceIndex];
        if (p && ps && ps.ownerId === p.id) {
          if (ps.houses === 4) {
            const cost = sp.hotelCost || 100;
            if (p.cash >= cost && state.availableHotels > 0) {
              p.cash -= cost;
              ps.houses = 0;
              ps.hasHotel = true;
              state.availableHouses += 4;
              state.availableHotels -= 1;
              state.logs.push({
                id: `log_${Date.now()}`,
                timestamp: Date.now(),
                text: `🏨 ${p.name} built a Luxury Hotel on ${sp.name}!`,
                type: 'BUILD',
              });
            }
          } else {
            const cost = sp.houseCost || 50;
            if (p.cash >= cost && state.availableHouses > 0) {
              p.cash -= cost;
              ps.houses += 1;
              state.availableHouses -= 1;
              state.logs.push({
                id: `log_${Date.now()}`,
                timestamp: Date.now(),
                text: `🏡 ${p.name} built house #${ps.houses} on ${sp.name}!`,
                type: 'BUILD',
              });
            }
          }
        }
        return state;
      });
    },
    [gameState, myPlayerId, socket, syncState]
  );

  const mortgageProperty = useCallback(
    (spaceIndex: number) => {
      if (!gameState || !myPlayerId) return;
      sounds.playCash();
      if (socket && !isSupabaseConfigured) {
        socket.emit('mortgage_property', { roomCode: gameState.roomCode, playerId: myPlayerId, spaceIndex });
        return;
      }
      syncState((state) => {
        const p = state.players.find((pl) => pl.id === myPlayerId);
        const sp = BOARD_SPACES[spaceIndex];
        const ps = state.properties[spaceIndex];
        if (p && ps && ps.ownerId === p.id && !ps.isMortgaged) {
          const val = sp.mortgageValue || 50;
          ps.isMortgaged = true;
          p.cash += val;
          state.logs.push({
            id: `log_${Date.now()}`,
            timestamp: Date.now(),
            text: `📄 ${p.name} mortgaged ${sp.name} for Rs ${val}!`,
            type: 'MORTGAGE',
          });
        }
        return state;
      });
    },
    [gameState, myPlayerId, socket, syncState]
  );

  const unmortgageProperty = useCallback(
    (spaceIndex: number) => {
      if (!gameState || !myPlayerId) return;
      sounds.playCash();
      if (socket && !isSupabaseConfigured) {
        socket.emit('unmortgage_property', { roomCode: gameState.roomCode, playerId: myPlayerId, spaceIndex });
        return;
      }
      syncState((state) => {
        const p = state.players.find((pl) => pl.id === myPlayerId);
        const sp = BOARD_SPACES[spaceIndex];
        const ps = state.properties[spaceIndex];
        const cost = Math.floor((sp.mortgageValue || 50) * (1 + state.settings.mortgageInterest));
        if (p && ps && ps.ownerId === p.id && ps.isMortgaged && p.cash >= cost) {
          p.cash -= cost;
          ps.isMortgaged = false;
          state.logs.push({
            id: `log_${Date.now()}`,
            timestamp: Date.now(),
            text: `📄 ${p.name} lifted mortgage on ${sp.name} for Rs ${cost}!`,
            type: 'MORTGAGE',
          });
        }
        return state;
      });
    },
    [gameState, myPlayerId, socket, syncState]
  );

  const payBail = useCallback(() => {
    if (!gameState || !myPlayerId) return;
    if (socket && !isSupabaseConfigured) {
      socket.emit('pay_bail', { roomCode: gameState.roomCode, playerId: myPlayerId });
      return;
    }
    syncState((state) => {
      const p = state.players.find((pl) => pl.id === myPlayerId);
      const bail = state.settings.jailBail;
      if (p && p.inJail && p.cash >= bail) {
        p.cash -= bail;
        p.inJail = false;
        p.jailTurns = 0;
        state.logs.push({
          id: `log_${Date.now()}`,
          timestamp: Date.now(),
          text: `🔓 ${p.name} paid Rs ${bail} bail (chai paani) and left THANA!`,
          type: 'JAIL',
        });
      }
      return state;
    });
  }, [gameState, myPlayerId, socket, syncState]);

  const useJailCard = useCallback(() => {
    if (!gameState || !myPlayerId) return;
    if (socket && !isSupabaseConfigured) {
      socket.emit('use_jail_card', { roomCode: gameState.roomCode, playerId: myPlayerId });
      return;
    }
    syncState((state) => {
      const p = state.players.find((pl) => pl.id === myPlayerId);
      if (p && p.inJail && p.getOutOfJailCards > 0) {
        p.getOutOfJailCards -= 1;
        p.inJail = false;
        p.jailTurns = 0;
        state.logs.push({
          id: `log_${Date.now()}`,
          timestamp: Date.now(),
          text: `⚖️ ${p.name} used "Cousin in Government" card to leave THANA!`,
          type: 'JAIL',
        });
      }
      return state;
    });
  }, [gameState, myPlayerId, socket, syncState]);

  const endTurn = useCallback(() => {
    if (!gameState || !myPlayerId) return;
    if (socket && !isSupabaseConfigured) {
      socket.emit('end_turn', { roomCode: gameState.roomCode, playerId: myPlayerId });
      return;
    }
    syncState((state) => {
      state.diceRolled = false;
      state.hasMovedThisTurn = false;
      state.consecutiveDoubles = 0;
      let nextIdx = (state.currentPlayerIndex + 1) % state.players.length;
      while (state.players[nextIdx].isBankrupt) {
        nextIdx = (nextIdx + 1) % state.players.length;
      }
      state.currentPlayerIndex = nextIdx;
      state.turnNumber += 1;
      const nextP = state.players[nextIdx];
      state.logs.push({
        id: `log_${Date.now()}`,
        timestamp: Date.now(),
        text: `👉 Turn ${state.turnNumber}: ${nextP.name}'s turn!`,
        type: 'ROLL',
      });
      return state;
    });
  }, [gameState, myPlayerId, socket, syncState]);

  const placeAuctionBid = useCallback(
    (amount: number) => {
      if (!gameState || !myPlayerId) return;
      sounds.playCash();
      if (socket && !isSupabaseConfigured) {
        socket.emit('place_auction_bid', { roomCode: gameState.roomCode, playerId: myPlayerId, amount });
      }
    },
    [socket, gameState, myPlayerId]
  );

  const foldAuction = useCallback(() => {
    if (!gameState || !myPlayerId) return;
    if (socket && !isSupabaseConfigured) {
      socket.emit('fold_auction', { roomCode: gameState.roomCode, playerId: myPlayerId });
    }
  }, [socket, gameState, myPlayerId]);

  const createTradeOffer = useCallback(
    (
      toPlayerId: string,
      offeredCash: number,
      offeredProperties: number[],
      offeredJailCards: number,
      requestedCash: number,
      requestedProperties: number[],
      requestedJailCards: number
    ) => {
      if (!gameState || !myPlayerId) return;
      if (socket && !isSupabaseConfigured) {
        socket.emit(
          'create_trade_offer',
          {
            roomCode: gameState.roomCode,
            fromPlayerId: myPlayerId,
            toPlayerId,
            offeredCash,
            offeredProperties,
            offeredJailCards,
            requestedCash,
            requestedProperties,
            requestedJailCards,
          },
          (res: any) => {
            if (res?.success) setShowTradeModal(false);
          }
        );
      }
    },
    [socket, gameState, myPlayerId]
  );

  const respondTrade = useCallback(
    (offerId: string, accept: boolean) => {
      if (!gameState) return;
      if (socket && !isSupabaseConfigured) {
        socket.emit('respond_trade', { roomCode: gameState.roomCode, offerId, accept });
      }
    },
    [socket, gameState]
  );

  const sendChat = useCallback(
    (message: string) => {
      if (!gameState || !myPlayerId || !message.trim()) return;
      if (socket && !isSupabaseConfigured) {
        socket.emit('send_chat', { roomCode: gameState.roomCode, playerId: myPlayerId, message });
        return;
      }
      syncState((state) => {
        const p = state.players.find((pl) => pl.id === myPlayerId);
        state.logs.push({
          id: `log_${Date.now()}`,
          timestamp: Date.now(),
          text: `${p?.name || 'Player'}: ${message}`,
          type: 'CHAT',
        });
        return state;
      });
    },
    [socket, gameState, myPlayerId, syncState]
  );

  const leaveRoom = useCallback(() => {
    SupabaseGameSync.unsubscribe();
    setGameState(null);
  }, []);

  const myPlayer = gameState?.players.find((p) => p.id === myPlayerId) || null;
  const isMyTurn = Boolean(gameState && myPlayer && gameState.players[gameState.currentPlayerIndex]?.id === myPlayerId);
  const isHost = Boolean(gameState && myPlayer && gameState.hostId === myPlayerId);

  return {
    socket,
    connected,
    gameState,
    myPlayerId,
    myPlayer,
    isMyTurn,
    isHost,
    selectedPropertyIndex,
    setSelectedPropertyIndex,
    showTradeModal,
    setShowTradeModal,
    tradeTargetPlayer,
    setTradeTargetPlayer,
    activeCardPopup,
    setActiveCardPopup,
    createRoom,
    joinRoom,
    addBot,
    removeBot,
    updateSettings,
    startGame,
    rollDice,
    buyProperty,
    declineBuy,
    buildHouse,
    mortgageProperty,
    unmortgageProperty,
    payBail,
    useJailCard,
    endTurn,
    placeAuctionBid,
    foldAuction,
    createTradeOffer,
    respondTrade,
    sendChat,
    leaveRoom,
  };
}
