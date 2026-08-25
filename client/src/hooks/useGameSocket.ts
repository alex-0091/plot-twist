import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState, Player, GameSettings, Card, TradeOffer, AuctionState } from '../types';
import { sounds } from '../audio/SoundEffects';
import { isSupabaseConfigured } from '../services/supabaseClient';
import { SupabaseGameSync } from '../services/supabaseGameSync';
import { BOARD_SPACES, CITY_GROUP_MEMBERS, TRANSPORT_SPACES, UTILITY_SPACES } from '../types';
import { BOT_PERSONALITIES } from '../types';
import { ALL_CARDS } from '../types';
import { BotEngine } from '../services/botEngine';

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
        const res = await SupabaseGameSync.joinRoom(roomCode, newPlayer, myPlayerId);
        if (res.success && res.state) {
          const finalId = res.reclaimedPlayerId || pId;
          setMyPlayerId(finalId);
          localStorage.setItem('pt_player_id', finalId);
          handleStateChange(res.state);
          SupabaseGameSync.subscribeToRoom(roomCode, handleStateChange);
          return true;
        } else {
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
            resolve(false);
          }
        });
      });
    },
    [socket, myPlayerId, handleStateChange]
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
        text: `🤖 ${botPlayer.name} joined the room!`,
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

  // Execute a card effect
  const executeCardEffect = (card: Card, player: Player, state: GameState) => {
    let houseCount = 0;
    let hotelCount = 0;
    player.properties.forEach((pIdx) => {
      const ps = state.properties[pIdx];
      if (ps?.hasHotel) hotelCount++;
      else if (ps?.houses) houseCount += ps.houses;
    });

    switch (card.actionType) {
      case 'MONEY_ADD':
        player.cash += card.amount || 100;
        break;
      case 'MONEY_SUBTRACT':
      case 'PAY_TO_BANK':
        player.cash -= card.amount || 50;
        break;
      case 'COLLECT_FROM_ALL': {
        const perPlayer = card.amount || 50;
        state.players.forEach((other) => {
          if (other.id !== player.id && !other.isBankrupt) {
            other.cash -= perPlayer;
            player.cash += perPlayer;
          }
        });
        break;
      }
      case 'PAY_TO_ALL': {
        const perPlayer = card.amount || 20;
        state.players.forEach((other) => {
          if (other.id !== player.id && !other.isBankrupt) {
            player.cash -= perPlayer;
            other.cash += perPlayer;
          }
        });
        break;
      }
      case 'PER_BUILDING_ASSESSMENT': {
        const perH = card.perHouseCost || 25;
        const perHotel = card.perHotelCost || 100;
        const totalTax = houseCount * perH + hotelCount * perHotel;
        player.cash -= totalTax;
        state.logs.push({
          id: `log_${Date.now()}_tax`,
          timestamp: Date.now(),
          text: `🏘️ ${player.name} owns ${houseCount} houses & ${hotelCount} hotels. Paid Rs ${totalTax}!`,
          type: 'RENT',
        });
        break;
      }
      case 'GET_OUT_OF_JAIL':
        player.getOutOfJailCards += 1;
        break;
      case 'GO_TO_JAIL':
        player.position = 10;
        player.inJail = true;
        player.jailTurns = 0;
        break;
      case 'MOVE_TO':
        if (card.targetPosition !== undefined) {
          if (card.targetPosition === 0) {
            player.cash += state.settings.salaryOnStart;
          }
          player.position = card.targetPosition;
        }
        break;
    }
  };

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
            let rent = sp.rent || 15;
            if (ps.hasHotel) rent = sp.rentWithHotel || rent * 5;
            else if (ps.houses === 4) rent = sp.rentWith4Houses || rent * 4;
            else if (ps.houses === 3) rent = sp.rentWith3Houses || rent * 3;
            else if (ps.houses === 2) rent = sp.rentWith2Houses || rent * 2;
            else if (ps.houses === 1) rent = sp.rentWith1House || rent * 1.5;

            curP.cash -= Math.floor(rent);
            owner.cash += Math.floor(rent);
            state.logs.push({
              id: `log_${Date.now()}_rent`,
              timestamp: Date.now(),
              text: `💸 ${curP.name} paid Rs ${Math.floor(rent)} rent to ${owner.name} for ${sp.name}!`,
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
      } else if (sp.type.startsWith('CARD_')) {
        const deckType = sp.type === 'CARD_SCENE_ON_HAI' ? 'SCENE_ON_HAI' : 'PAKISTAN_ZINDABAD';
        const deck = ALL_CARDS.filter((c) => c.deck === deckType);
        const card = deck[Math.floor(Math.random() * deck.length)];
        state.lastCardDrawn = card;
        executeCardEffect(card, curP, state);
        state.logs.push({
          id: `log_${Date.now()}_card`,
          timestamp: Date.now(),
          text: `🎴 ${curP.name} drew "${card.title}": ${card.actionText}`,
          type: 'CARD',
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
      let attempts = 0;
      while (state.players[nextIdx].isBankrupt && attempts < state.players.length) {
        nextIdx = (nextIdx + 1) % state.players.length;
        attempts++;
      }

      // Check Winner
      const activePlayers = state.players.filter((p) => !p.isBankrupt);
      if (activePlayers.length === 1) {
        state.status = 'GAME_OVER';
        state.winnerId = activePlayers[0].id;
        state.logs.push({
          id: `log_${Date.now()}_win`,
          timestamp: Date.now(),
          text: `👑 ${activePlayers[0].name} OWNS PAKISTAN! VICTORY!`,
          type: 'CHAT',
        });
        return state;
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

  // ==========================================
  // AUTOMATED BOT TURN ORCHESTRATOR
  // ==========================================
  const isHost = Boolean(gameState && myPlayerId && gameState.hostId === myPlayerId);

  useEffect(() => {
    if (!gameState || gameState.status !== 'PLAYING') return;
    const curP = gameState.players[gameState.currentPlayerIndex];
    if (!curP || !curP.isBot || curP.isBankrupt) return;

    if (!isHost) return;

    const timer = setTimeout(() => {
      syncState((state) => {
        const bot = state.players[state.currentPlayerIndex];
        if (!bot || !bot.isBot || bot.isBankrupt) return state;

        // 1. Jail decision
        if (bot.inJail) {
          if (BotEngine.shouldPayBail(bot, state)) {
            bot.cash -= state.settings.jailBail;
            bot.inJail = false;
            bot.jailTurns = 0;
          } else if (bot.getOutOfJailCards > 0) {
            bot.getOutOfJailCards -= 1;
            bot.inJail = false;
            bot.jailTurns = 0;
          }
        }

        // 2. Roll dice if hasn't rolled
        if (!state.diceRolled) {
          const d1 = Math.floor(Math.random() * 6) + 1;
          const d2 = Math.floor(Math.random() * 6) + 1;
          state.lastDice = [d1, d2];
          state.diceRolled = true;
          const total = d1 + d2;
          const isDouble = d1 === d2;

          state.logs.push({
            id: `log_${Date.now()}_bot`,
            timestamp: Date.now(),
            text: `🎲 ${bot.name} rolled [${d1}, ${d2}] = ${total}${isDouble ? ' (DOUBLES!)' : ''}`,
            type: 'ROLL',
          });

          if (bot.inJail) {
            if (isDouble) {
              bot.inJail = false;
              bot.jailTurns = 0;
              bot.position = (bot.position + total) % 40;
            } else {
              bot.jailTurns += 1;
            }
          } else {
            const oldPos = bot.position;
            const newPos = (oldPos + total) % 40;
            bot.position = newPos;

            // Passed START
            if (newPos < oldPos && oldPos !== 0) {
              bot.cash += state.settings.salaryOnStart;
              state.logs.push({
                id: `log_${Date.now()}_sal_bot`,
                timestamp: Date.now(),
                text: `💵 ${bot.name} passed START and collected Rs ${state.settings.salaryOnStart}!`,
                type: 'MOVE',
              });
            }

            const sp = BOARD_SPACES[newPos];
            // Rent
            if (['PROPERTY', 'TRANSPORT', 'UTILITY'].includes(sp.type)) {
              const ps = state.properties[sp.index];
              if (ps && ps.ownerId && ps.ownerId !== bot.id && !ps.isMortgaged) {
                const owner = state.players.find((p) => p.id === ps.ownerId);
                if (owner && !owner.isBankrupt) {
                  let rent = sp.rent || 15;
                  if (ps.hasHotel) rent = sp.rentWithHotel || rent * 5;
                  else if (ps.houses) rent = sp.rentWith1House || rent * 1.5;
                  bot.cash -= Math.floor(rent);
                  owner.cash += Math.floor(rent);
                }
              } else if (ps && !ps.ownerId) {
                // Buy Decision
                if (BotEngine.shouldBuyProperty(bot, sp.index, state)) {
                  const price = sp.price || 100;
                  bot.cash -= price;
                  ps.ownerId = bot.id;
                  bot.properties.push(sp.index);
                  state.logs.push({
                    id: `log_${Date.now()}_buy_bot`,
                    timestamp: Date.now(),
                    text: `🏠 ${bot.name} bought ${sp.name} for Rs ${price}!`,
                    type: 'BUY',
                  });
                }
              }
            } else if (sp.type === 'GO_TO_JAIL') {
              bot.position = 10;
              bot.inJail = true;
              bot.jailTurns = 0;
            } else if (sp.type === 'TAX') {
              bot.cash -= sp.taxAmount || 100;
            } else if (sp.type.startsWith('CARD_')) {
              const deckType = sp.type === 'CARD_SCENE_ON_HAI' ? 'SCENE_ON_HAI' : 'PAKISTAN_ZINDABAD';
              const deck = ALL_CARDS.filter((c) => c.deck === deckType);
              const card = deck[Math.floor(Math.random() * deck.length)];
              state.lastCardDrawn = card;
              executeCardEffect(card, bot, state);
            }

            // Check Building
            const buildableIdx = BotEngine.findBuildableProperty(bot, state);
            if (buildableIdx !== null) {
              const bProp = state.properties[buildableIdx];
              const bSpace = BOARD_SPACES[buildableIdx];
              if (bProp && bProp.houses === 4 && state.availableHotels > 0) {
                bot.cash -= bSpace.hotelCost || 100;
                bProp.houses = 0;
                bProp.hasHotel = true;
                state.availableHotels -= 1;
                state.availableHouses += 4;
              } else if (bProp && state.availableHouses > 0) {
                bot.cash -= bSpace.houseCost || 50;
                bProp.houses += 1;
                state.availableHouses -= 1;
              }
            }

            // Bankruptcy check
            if (bot.cash < 0) {
              bot.isBankrupt = true;
              bot.properties.forEach((pIdx) => {
                state.properties[pIdx].ownerId = null;
                state.properties[pIdx].houses = 0;
                state.properties[pIdx].hasHotel = false;
                state.properties[pIdx].isMortgaged = false;
              });
              bot.properties = [];
              state.logs.push({
                id: `log_${Date.now()}_bankrupt`,
                timestamp: Date.now(),
                text: `💀 ${bot.name} went BANKRUPT! All plots returned to Bank.`,
                type: 'BANKRUPT',
              });
            }
          }

          // 3. End bot turn automatically after brief delay
          state.diceRolled = false;
          state.hasMovedThisTurn = false;
          let nextIdx = (state.currentPlayerIndex + 1) % state.players.length;
          let attempts = 0;
          while (state.players[nextIdx].isBankrupt && attempts < state.players.length) {
            nextIdx = (nextIdx + 1) % state.players.length;
            attempts++;
          }

          state.currentPlayerIndex = nextIdx;
          state.turnNumber += 1;
          const nextP = state.players[nextIdx];
          state.logs.push({
            id: `log_${Date.now()}_next`,
            timestamp: Date.now(),
            text: `👉 Turn ${state.turnNumber}: ${nextP.name}'s turn!`,
            type: 'ROLL',
          });
        }

        return state;
      });
    }, 1200);

    return () => clearTimeout(timer);
  }, [gameState?.currentPlayerIndex, gameState?.status, gameState?.turnNumber, isHost, syncState]);

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
        return;
      }

      syncState((state) => {
        const tradeId = `trade_${Date.now()}`;
        state.activeTrade = {
          id: tradeId,
          fromPlayerId: myPlayerId,
          toPlayerId,
          offeredCash,
          offeredProperties,
          offeredJailCards,
          requestedCash,
          requestedProperties,
          requestedJailCards,
          status: 'PENDING',
        };
        const sender = state.players.find((p) => p.id === myPlayerId);
        const target = state.players.find((p) => p.id === toPlayerId);
        state.logs.push({
          id: `log_${Date.now()}_trade`,
          timestamp: Date.now(),
          text: `🤝 ${sender?.name} proposed a trade deal to ${target?.name}!`,
          type: 'CHAT',
        });
        return state;
      });
      setShowTradeModal(false);
    },
    [socket, gameState, myPlayerId, syncState]
  );

  const respondTrade = useCallback(
    (offerId: string, accept: boolean) => {
      if (!gameState) return;
      if (socket && !isSupabaseConfigured) {
        socket.emit('respond_trade', { roomCode: gameState.roomCode, offerId, accept });
        return;
      }

      syncState((state) => {
        if (!state.activeTrade || state.activeTrade.id !== offerId) return state;
        const trade = state.activeTrade;
        const p1 = state.players.find((p) => p.id === trade.fromPlayerId);
        const p2 = state.players.find((p) => p.id === trade.toPlayerId);

        if (accept && p1 && p2) {
          p1.cash = p1.cash - trade.offeredCash + trade.requestedCash;
          p2.cash = p2.cash - trade.requestedCash + trade.offeredCash;

          trade.offeredProperties.forEach((idx) => {
            p1.properties = p1.properties.filter((i) => i !== idx);
            p2.properties.push(idx);
            state.properties[idx].ownerId = p2.id;
          });

          trade.requestedProperties.forEach((idx) => {
            p2.properties = p2.properties.filter((i) => i !== idx);
            p1.properties.push(idx);
            state.properties[idx].ownerId = p1.id;
          });

          state.logs.push({
            id: `log_${Date.now()}_taccept`,
            timestamp: Date.now(),
            text: `✅ Trade accepted between ${p1.name} and ${p2.name}! Registry transferred.`,
            type: 'BUY',
          });
        } else if (p1 && p2) {
          state.logs.push({
            id: `log_${Date.now()}_tdec`,
            timestamp: Date.now(),
            text: `✕ ${p2.name} declined trade offer from ${p1.name}.`,
            type: 'CHAT',
          });
        }

        state.activeTrade = null;
        return state;
      });
    },
    [socket, gameState, syncState]
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
