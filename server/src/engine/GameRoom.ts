import {
  GameState,
  Player,
  PropertyState,
  GameSettings,
  GameLogEntry,
  Card,
} from '../../../shared/types.js';
import { BOARD_SPACES, CITY_GROUP_MEMBERS, TRANSPORT_SPACES, UTILITY_SPACES } from '../../../shared/boardData.js';
import { DEFAULT_GAME_SETTINGS } from '../../../shared/defaultSettings.js';
import { CardEngine } from './CardEngine.js';
import { AuctionEngine } from './AuctionEngine.js';
import { TradeEngine } from './TradeEngine.js';
import { BotAI } from './BotAI.js';

export class GameRoom {
  public state: GameState;
  public cardEngine: CardEngine;
  public auctionEngine: AuctionEngine;
  public tradeEngine: TradeEngine;

  private onStateChangeCallback: ((state: GameState) => void) | null = null;
  private botTurnTimer: NodeJS.Timeout | null = null;

  constructor(roomCode: string, roomName: string, hostPlayer: Player, settings?: Partial<GameSettings>) {
    this.cardEngine = new CardEngine();
    this.auctionEngine = new AuctionEngine();
    this.tradeEngine = new TradeEngine();

    const mergedSettings: GameSettings = { ...DEFAULT_GAME_SETTINGS, ...(settings || {}) };

    const initialProperties: Record<number, PropertyState> = {};
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

    this.state = {
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
      logs: [],
    };

    this.addLog(`Room "${roomName}" created by ${hostPlayer.name}. Welcome to PLOT TWIST 🇵🇰!`, 'CHAT');
  }

  public setOnStateChange(cb: (state: GameState) => void) {
    this.onStateChangeCallback = cb;
  }

  private notify() {
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(this.state);
    }
  }

  public addLog(text: string, type: GameLogEntry['type'], playerId?: string, urduFlavor?: string) {
    const entry: GameLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      text,
      type,
      playerId,
      urduFlavor,
    };
    this.state.logs.push(entry);
    if (this.state.logs.length > 80) {
      this.state.logs.shift();
    }
  }

  public addPlayer(player: Player): { success: boolean; error?: string } {
    if (this.state.status !== 'LOBBY') {
      return { success: false, error: 'Game already in progress' };
    }
    if (this.state.players.length >= 8) {
      return { success: false, error: 'Room is full (max 8 players)' };
    }
    // ensure unique token or name
    player.cash = this.state.settings.startingMoney;
    this.state.players.push(player);
    this.addLog(`${player.name} joined the room!`, 'CHAT', player.id);
    this.notify();
    return { success: true };
  }

  public removePlayer(playerId: string) {
    const pIdx = this.state.players.findIndex((p) => p.id === playerId);
    if (pIdx === -1) return;

    const player = this.state.players[pIdx];
    this.addLog(`${player.name} left the room.`, 'CHAT', playerId);

    if (this.state.status === 'LOBBY') {
      this.state.players.splice(pIdx, 1);
      if (this.state.hostId === playerId && this.state.players.length > 0) {
        this.state.hostId = this.state.players[0].id;
      }
    } else {
      // Mark bankrupt / surrender
      this.handleBankruptcy(playerId, null, 'left the match');
    }
    this.notify();
  }

  public updateSettings(hostId: string, newSettings: Partial<GameSettings>): boolean {
    if (this.state.hostId !== hostId || this.state.status !== 'LOBBY') return false;
    this.state.settings = { ...this.state.settings, ...newSettings };
    // update cash of all players if in lobby
    this.state.players.forEach((p) => (p.cash = this.state.settings.startingMoney));
    this.addLog('Host updated room settings.', 'CHAT');
    this.notify();
    return true;
  }

  public startGame(hostId: string): { success: boolean; error?: string } {
    if (this.state.hostId !== hostId) {
      return { success: false, error: 'Only host can start the game' };
    }
    if (this.state.players.length < 2) {
      return { success: false, error: 'Need at least 2 players to start' };
    }

    this.state.status = 'PLAYING';
    this.state.currentPlayerIndex = 0;
    this.state.turnNumber = 1;
    this.state.diceRolled = false;
    this.state.hasMovedThisTurn = false;
    this.state.consecutiveDoubles = 0;

    const firstPlayer = this.getCurrentPlayer();
    this.addLog(`🎲 Game started! First turn: ${firstPlayer.name}. Bismillah!`, 'ROLL', firstPlayer.id);
    this.notify();

    this.triggerBotTurnIfNeeded();
    return { success: true };
  }

  public getCurrentPlayer(): Player {
    return this.state.players[this.state.currentPlayerIndex];
  }

  // Roll Dice Action
  public rollDice(playerId: string): { success: boolean; error?: string; dice?: [number, number] } {
    const player = this.getCurrentPlayer();
    if (player.id !== playerId) return { success: false, error: 'Not your turn' };
    if (this.state.status !== 'PLAYING') return { success: false, error: 'Game not in active playing state' };
    if (this.state.diceRolled) return { success: false, error: 'Dice already rolled this turn' };

    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    this.state.lastDice = [d1, d2];
    this.state.diceRolled = true;
    const isDouble = d1 === d2;
    const totalRoll = d1 + d2;

    this.addLog(
      `🎲 ${player.name} rolled [${d1}, ${d2}] = ${totalRoll}${isDouble ? ' (DOUBLES!)' : ''}`,
      'ROLL',
      player.id
    );

    // Jail Handling
    if (player.inJail) {
      if (isDouble) {
        player.inJail = false;
        player.jailTurns = 0;
        this.state.consecutiveDoubles = 0;
        this.addLog(`🔓 ${player.name} rolled doubles and broke out of THANA!`, 'JAIL', player.id);
        this.movePlayer(player, totalRoll);
      } else {
        player.jailTurns += 1;
        if (player.jailTurns >= this.state.settings.maxJailTurns) {
          // Force bail
          const bail = this.state.settings.jailBail;
          if (player.cash >= bail) {
            player.cash -= bail;
            player.inJail = false;
            player.jailTurns = 0;
            this.addLog(`👮 ${player.name} served max jail time, paid Rs ${bail} bail, and was released!`, 'JAIL', player.id);
            this.movePlayer(player, totalRoll);
          } else {
            this.handleBankruptcy(player.id, null, 'unable to pay Thana bail');
          }
        } else {
          this.addLog(
            `🚔 ${player.name} failed to roll doubles (Turn ${player.jailTurns}/${this.state.settings.maxJailTurns} in THANA).`,
            'JAIL',
            player.id
          );
          this.state.hasMovedThisTurn = true;
        }
      }
      this.notify();
      this.triggerBotTurnIfNeeded();
      return { success: true, dice: [d1, d2] };
    }

    // Normal movement
    if (isDouble) {
      this.state.consecutiveDoubles += 1;
      if (this.state.consecutiveDoubles >= 3 && this.state.settings.tripleDoublesJail) {
        this.addLog(`🚨 ${player.name} rolled 3 consecutive doubles! Over-speeding straight to THANA!`, 'JAIL', player.id);
        this.sendToJail(player);
        this.notify();
        this.triggerBotTurnIfNeeded();
        return { success: true, dice: [d1, d2] };
      }
    } else {
      this.state.consecutiveDoubles = 0;
    }

    this.movePlayer(player, totalRoll);
    this.notify();
    this.triggerBotTurnIfNeeded();
    return { success: true, dice: [d1, d2] };
  }

  public payBail(playerId: string): { success: boolean; error?: string } {
    const player = this.getCurrentPlayer();
    if (player.id !== playerId) return { success: false, error: 'Not your turn' };
    if (!player.inJail) return { success: false, error: 'You are not in jail' };
    if (this.state.diceRolled) return { success: false, error: 'Cannot pay bail after rolling' };

    const bail = this.state.settings.jailBail;
    if (player.cash < bail) return { success: false, error: `Need Rs ${bail} for bail` };

    player.cash -= bail;
    player.inJail = false;
    player.jailTurns = 0;
    this.addLog(`🔓 ${player.name} paid Rs ${bail} bail (chai paani) and left THANA!`, 'JAIL', player.id);
    this.notify();
    return { success: true };
  }

  public useJailCard(playerId: string): { success: boolean; error?: string } {
    const player = this.getCurrentPlayer();
    if (player.id !== playerId) return { success: false, error: 'Not your turn' };
    if (!player.inJail) return { success: false, error: 'You are not in jail' };
    if (player.getOutOfJailCards <= 0) return { success: false, error: 'No Get Out of Jail cards' };

    player.getOutOfJailCards -= 1;
    player.inJail = false;
    player.jailTurns = 0;
    this.addLog(`⚖️ ${player.name} used "Cousin in Government" card to get out of THANA!`, 'JAIL', player.id);
    this.notify();
    return { success: true };
  }

  private sendToJail(player: Player) {
    player.position = 10;
    player.inJail = true;
    player.jailTurns = 0;
    this.state.hasMovedThisTurn = true;
    this.state.consecutiveDoubles = 0;
  }

  private movePlayer(player: Player, steps: number) {
    const oldPos = player.position;
    const newPos = (oldPos + steps) % 40;
    player.position = newPos;
    this.state.hasMovedThisTurn = true;

    // Passed START
    if (newPos < oldPos && oldPos !== 0) {
      player.cash += this.state.settings.salaryOnStart;
      this.addLog(
        `💵 ${player.name} passed SALARY AA GAYI and collected Rs ${this.state.settings.salaryOnStart}!`,
        'MOVE',
        player.id,
        'تنخواہ آ گئی!'
      );
    }

    const space = BOARD_SPACES[newPos];
    this.addLog(`🚶 ${player.name} landed on ${space.name} (#${newPos})`, 'MOVE', player.id);

    this.handleLanding(player, space);
  }

  private handleLanding(player: Player, space: (typeof BOARD_SPACES)[0]) {
    switch (space.type) {
      case 'PROPERTY':
      case 'TRANSPORT':
      case 'UTILITY': {
        const propState = this.state.properties[space.index];
        if (!propState.ownerId) {
          // Unowned
          if (this.state.settings.forcedAuctions) {
            this.startAuction(space.index);
          }
          // Otherwise player can buy or decline
        } else if (propState.ownerId !== player.id) {
          // Owned by someone else
          if (propState.isMortgaged) {
            this.addLog(`🛡️ ${space.name} is mortgaged. No rent due.`, 'RENT', player.id);
          } else {
            const owner = this.state.players.find((p) => p.id === propState.ownerId);
            if (owner && !owner.isBankrupt) {
              this.payRent(player, owner, space, propState);
            }
          }
        }
        break;
      }

      case 'TAX': {
        const tax = space.taxAmount || 100;
        this.addLog(`📋 ${player.name} landed on ${space.name}. Paid Rs ${tax} tax!`, 'RENT', player.id);
        if (this.state.settings.freeParkingMode === 'POT') {
          this.state.freeParkingPot += tax;
        }
        if (player.cash >= tax) {
          player.cash -= tax;
        } else {
          this.handleBankruptcy(player.id, null, `unable to pay tax (${space.name})`);
        }
        break;
      }

      case 'CARD_SCENE_ON_HAI':
      case 'CARD_PAKISTAN_ZINDABAD': {
        const deckType = space.type === 'CARD_SCENE_ON_HAI' ? 'SCENE_ON_HAI' : 'PAKISTAN_ZINDABAD';
        const card = this.cardEngine.drawCard(deckType);
        this.state.lastCardDrawn = card;
        const result = this.cardEngine.executeCard(
          card,
          player,
          this.state.players,
          this.state.properties,
          this.state.settings.salaryOnStart
        );

        this.addLog(result.logMessage, 'CARD', player.id, result.urduFlavor);

        // Apply money deltas
        Object.entries(result.moneyDeltas).forEach(([pId, delta]) => {
          const targetPlayer = this.state.players.find((p) => p.id === pId);
          if (targetPlayer && !targetPlayer.isBankrupt) {
            targetPlayer.cash += delta;
            if (targetPlayer.cash < 0) {
              this.handleBankruptcy(targetPlayer.id, delta < 0 ? player.id : null, `card effect (${card.title})`);
            }
          }
        });

        if (result.sentToJail) {
          this.sendToJail(player);
        } else if (result.positionChange !== undefined) {
          player.position = result.positionChange;
          const targetSpace = BOARD_SPACES[player.position];
          this.handleLanding(player, targetSpace);
        }

        if (result.transferredProperty) {
          const { spaceIndex, fromPlayerId, toPlayerId } = result.transferredProperty;
          const fromP = this.state.players.find((p) => p.id === fromPlayerId);
          const toP = this.state.players.find((p) => p.id === toPlayerId);
          if (fromP && toP) {
            fromP.properties = fromP.properties.filter((i) => i !== spaceIndex);
            toP.properties.push(spaceIndex);
            this.state.properties[spaceIndex].ownerId = toP.id;
          }
        }
        break;
      }

      case 'GO_TO_JAIL': {
        this.addLog(`🚔 ${player.name} met a Lahori and went straight to THANA!`, 'JAIL', player.id, 'غلط راستہ لے لیا!');
        this.sendToJail(player);
        break;
      }

      case 'FREE_PARKING': {
        if (this.state.settings.freeParkingMode === 'POT' && this.state.freeParkingPot > 0) {
          const pot = this.state.freeParkingPot;
          player.cash += pot;
          this.state.freeParkingPot = 0;
          this.addLog(`🎭 ${player.name} visited HIRA MANDI and won the Jackpot of Rs ${pot}!`, 'MOVE', player.id);
        } else if (this.state.settings.freeParkingMode === 'FIXED') {
          player.cash += this.state.settings.freeParkingAmount;
          this.addLog(`🎭 ${player.name} collected Rs ${this.state.settings.freeParkingAmount} at HIRA MANDI!`, 'MOVE', player.id);
        } else {
          this.addLog(`🎭 ${player.name} is resting at HIRA MANDI. No rent to pay!`, 'MOVE', player.id);
        }
        break;
      }

      case 'START':
      case 'JUST_VISITING':
      default:
        break;
    }
  }

  private calculateRent(space: (typeof BOARD_SPACES)[0], propState: PropertyState, owner: Player): number {
    if (space.type === 'PROPERTY') {
      if (propState.hasHotel) return space.rentWithHotel || 500;
      if (propState.houses === 4) return space.rentWith4Houses || 400;
      if (propState.houses === 3) return space.rentWith3Houses || 270;
      if (propState.houses === 2) return space.rentWith2Houses || 90;
      if (propState.houses === 1) return space.rentWith1House || 30;

      // Check full city group
      if (space.cityGroup) {
        const groupMembers = CITY_GROUP_MEMBERS[space.cityGroup];
        const ownsAll = groupMembers.every((idx) => owner.properties.includes(idx));
        if (ownsAll) {
          return space.rentWithSet || (space.rent || 10) * 2;
        }
      }
      return space.rent || 10;
    }

    if (space.type === 'TRANSPORT') {
      const ownedTransports = TRANSPORT_SPACES.filter((idx) => owner.properties.includes(idx)).length;
      switch (ownedTransports) {
        case 1:
          return 25;
        case 2:
          return 50;
        case 3:
          return 100;
        case 4:
          return 200;
        default:
          return 25;
      }
    }

    if (space.type === 'UTILITY') {
      const ownedUtilities = UTILITY_SPACES.filter((idx) => owner.properties.includes(idx)).length;
      const diceSum = this.state.lastDice[0] + this.state.lastDice[1];
      const multiplier = ownedUtilities >= 2 ? 10 : 4;
      return diceSum * multiplier;
    }

    return 0;
  }

  private payRent(player: Player, owner: Player, space: (typeof BOARD_SPACES)[0], propState: PropertyState) {
    const rent = this.calculateRent(space, propState, owner);
    this.addLog(
      `💸 ${player.name} paid Rs ${rent} rent to ${owner.name} for ${space.name}!`,
      'RENT',
      player.id,
      'کرایہ وصولی!'
    );

    if (player.cash >= rent) {
      player.cash -= rent;
      owner.cash += rent;
    } else {
      const remainingCash = player.cash;
      player.cash = 0;
      owner.cash += remainingCash;
      this.handleBankruptcy(player.id, owner.id, `unable to pay Rs ${rent} rent to ${owner.name}`);
    }
  }

  public buyProperty(playerId: string): { success: boolean; error?: string } {
    const player = this.getCurrentPlayer();
    if (player.id !== playerId) return { success: false, error: 'Not your turn' };
    if (!this.state.hasMovedThisTurn) return { success: false, error: 'Must roll dice first' };

    const space = BOARD_SPACES[player.position];
    if (!['PROPERTY', 'TRANSPORT', 'UTILITY'].includes(space.type)) {
      return { success: false, error: 'Current space is not purchasable' };
    }

    const propState = this.state.properties[space.index];
    if (propState.ownerId) {
      return { success: false, error: 'Property is already owned' };
    }

    const price = space.price || 100;
    if (player.cash < price) {
      return { success: false, error: `Not enough cash (Price: Rs ${price}, Cash: Rs ${player.cash})` };
    }

    player.cash -= price;
    propState.ownerId = player.id;
    player.properties.push(space.index);

    this.addLog(`🏠 ${player.name} bought ${space.name} for Rs ${price}! Registry done!`, 'BUY', player.id, 'مبارک ہو!');
    this.notify();
    this.triggerBotTurnIfNeeded();
    return { success: true };
  }

  public declineBuyProperty(playerId: string): { success: boolean } {
    const player = this.getCurrentPlayer();
    if (player.id !== playerId) return { success: false };

    const space = BOARD_SPACES[player.position];
    this.addLog(`${player.name} declined to buy ${space.name}.`, 'BUY', player.id);

    if (this.state.settings.auctionsEnabled) {
      this.startAuction(space.index);
    }
    this.notify();
    this.triggerBotTurnIfNeeded();
    return { success: true };
  }

  public startAuction(spaceIndex: number) {
    const space = BOARD_SPACES[spaceIndex];
    this.state.status = 'AUCTION';
    this.addLog(`📢 AUCTION STARTED for ${space.name}! Bidding is open!`, 'BUY', undefined, 'بولی شروع!');

    this.auctionEngine.startAuction(
      spaceIndex,
      this.state.players,
      (auction) => {
        this.state.currentAuction = auction;
        this.notify();
        this.triggerBotAuctionBid();
      },
      (winnerId, finalBid, propIdx) => {
        this.state.status = 'PLAYING';
        this.state.currentAuction = null;
        if (winnerId && finalBid > 0) {
          const winner = this.state.players.find((p) => p.id === winnerId);
          if (winner) {
            winner.cash -= finalBid;
            winner.properties.push(propIdx);
            this.state.properties[propIdx].ownerId = winner.id;
            this.addLog(`🏆 ${winner.name} won the auction for ${BOARD_SPACES[propIdx].name} at Rs ${finalBid}!`, 'BUY', winner.id);
          }
        } else {
          this.addLog(`Auction ended with no bids for ${BOARD_SPACES[propIdx].name}.`, 'BUY');
        }
        this.notify();
        this.triggerBotTurnIfNeeded();
      }
    );
  }

  public placeAuctionBid(playerId: string, amount: number): { success: boolean; error?: string } {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player) return { success: false, error: 'Player not found' };

    const result = this.auctionEngine.placeBid(playerId, amount, player.cash);
    if (result.success) {
      this.addLog(`💰 ${player.name} bid Rs ${amount} in auction!`, 'BUY', playerId);
      this.notify();
      this.triggerBotAuctionBid();
      return { success: true };
    }
    return { success: false, error: result.message };
  }

  public foldAuction(playerId: string): { success: boolean } {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player) return { success: false };

    const res = this.auctionEngine.foldPlayer(playerId);
    if (res.success) {
      this.addLog(`${player.name} folded from auction.`, 'BUY', playerId);
      this.notify();
    }
    return res;
  }

  public buildHouse(playerId: string, spaceIndex: number): { success: boolean; error?: string } {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player) return { success: false, error: 'Player not found' };

    const space = BOARD_SPACES[spaceIndex];
    if (space.type !== 'PROPERTY' || !space.cityGroup) {
      return { success: false, error: 'Can only build on city properties' };
    }

    const propState = this.state.properties[spaceIndex];
    if (propState.ownerId !== player.id) {
      return { success: false, error: 'You do not own this property' };
    }

    if (propState.isMortgaged) {
      return { success: false, error: 'Cannot build on mortgaged property' };
    }

    // Check complete city group
    const groupMembers = CITY_GROUP_MEMBERS[space.cityGroup];
    const ownsAll = groupMembers.every((idx) => player.properties.includes(idx));
    if (!ownsAll) {
      return { success: false, error: `Must own entire ${space.cityGroup} city group before building` };
    }

    // Check no mortgaged properties in group
    const anyMortgaged = groupMembers.some((idx) => this.state.properties[idx]?.isMortgaged);
    if (anyMortgaged) {
      return { success: false, error: 'Cannot build if any property in the city group is mortgaged' };
    }

    // Even Building Rule
    if (this.state.settings.evenBuild) {
      const currentLevel = propState.hasHotel ? 5 : propState.houses;
      for (const idx of groupMembers) {
        const otherState = this.state.properties[idx];
        const otherLevel = otherState.hasHotel ? 5 : otherState.houses;
        if (otherLevel < currentLevel) {
          return { success: false, error: 'Even building rule: Build on all group properties equally first!' };
        }
      }
    }

    if (propState.hasHotel) {
      return { success: false, error: 'Property already has a luxury hotel (max build)' };
    }

    if (propState.houses === 4) {
      // Build Hotel
      if (this.state.availableHotels <= 0) {
        return { success: false, error: 'No hotels left in the bank' };
      }
      const hotelCost = space.hotelCost || 100;
      if (player.cash < hotelCost) {
        return { success: false, error: `Need Rs ${hotelCost} to build Hotel` };
      }

      player.cash -= hotelCost;
      propState.houses = 0;
      propState.hasHotel = true;
      this.state.availableHouses += 4; // return 4 houses to bank
      this.state.availableHotels -= 1;

      this.addLog(`🏨 ${player.name} built a Luxury Hotel on ${space.name} (Rs ${hotelCost})! Shandar!`, 'BUILD', player.id);
      this.notify();
      return { success: true };
    } else {
      // Build House
      if (this.state.availableHouses <= 0) {
        return { success: false, error: 'No houses left in the bank' };
      }
      const houseCost = space.houseCost || 50;
      if (player.cash < houseCost) {
        return { success: false, error: `Need Rs ${houseCost} to build House` };
      }

      player.cash -= houseCost;
      propState.houses += 1;
      this.state.availableHouses -= 1;

      this.addLog(
        `🏡 ${player.name} built house #${propState.houses} on ${space.name} (Rs ${houseCost})!`,
        'BUILD',
        player.id
      );
      this.notify();
      return { success: true };
    }
  }

  public mortgageProperty(playerId: string, spaceIndex: number): { success: boolean; error?: string } {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player) return { success: false, error: 'Player not found' };

    const space = BOARD_SPACES[spaceIndex];
    const propState = this.state.properties[spaceIndex];
    if (propState.ownerId !== player.id) return { success: false, error: 'You do not own this property' };
    if (propState.isMortgaged) return { success: false, error: 'Property is already mortgaged' };

    if (space.cityGroup) {
      const groupMembers = CITY_GROUP_MEMBERS[space.cityGroup];
      const hasBuildings = groupMembers.some((idx) => {
        const ps = this.state.properties[idx];
        return ps.houses > 0 || ps.hasHotel;
      });
      if (hasBuildings) {
        return { success: false, error: 'Sell all houses/hotels in this city group before mortgaging' };
      }
    }

    const mortgageValue = space.mortgageValue || Math.floor((space.price || 100) / 2);
    propState.isMortgaged = true;
    player.cash += mortgageValue;

    this.addLog(`📄 ${player.name} mortgaged ${space.name} for Rs ${mortgageValue}!`, 'MORTGAGE', player.id);
    this.notify();
    return { success: true };
  }

  public unmortgageProperty(playerId: string, spaceIndex: number): { success: boolean; error?: string } {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player) return { success: false, error: 'Player not found' };

    const space = BOARD_SPACES[spaceIndex];
    const propState = this.state.properties[spaceIndex];
    if (propState.ownerId !== player.id) return { success: false, error: 'You do not own this property' };
    if (!propState.isMortgaged) return { success: false, error: 'Property is not mortgaged' };

    const mortgageVal = space.mortgageValue || Math.floor((space.price || 100) / 2);
    const unmortgageCost = Math.floor(mortgageVal * (1 + this.state.settings.mortgageInterest));

    if (player.cash < unmortgageCost) {
      return { success: false, error: `Need Rs ${unmortgageCost} to unmortgage (${space.mortgageValue} + 10% fee)` };
    }

    player.cash -= unmortgageCost;
    propState.isMortgaged = false;

    this.addLog(`📄 ${player.name} lifted mortgage on ${space.name} for Rs ${unmortgageCost}!`, 'MORTGAGE', player.id);
    this.notify();
    return { success: true };
  }

  public endTurn(playerId: string): { success: boolean; error?: string } {
    const player = this.getCurrentPlayer();
    if (player.id !== playerId) return { success: false, error: 'Not your turn' };
    if (!this.state.diceRolled && !player.inJail) return { success: false, error: 'Must roll dice before ending turn' };

    // If rolled double and not in jail, player gets another roll
    const isDouble = this.state.lastDice[0] === this.state.lastDice[1];
    if (isDouble && !player.inJail && this.state.settings.doublesExtraTurn && this.state.consecutiveDoubles > 0) {
      this.state.diceRolled = false;
      this.state.hasMovedThisTurn = false;
      this.addLog(`🎲 ${player.name} gets an extra roll for DOUBLES!`, 'ROLL', player.id);
      this.notify();
      this.triggerBotTurnIfNeeded();
      return { success: true };
    }

    this.advanceToNextPlayer();
    return { success: true };
  }

  private advanceToNextPlayer() {
    this.state.diceRolled = false;
    this.state.hasMovedThisTurn = false;
    this.state.consecutiveDoubles = 0;

    let nextIdx = (this.state.currentPlayerIndex + 1) % this.state.players.length;
    let attempts = 0;
    while (this.state.players[nextIdx].isBankrupt && attempts < this.state.players.length) {
      nextIdx = (nextIdx + 1) % this.state.players.length;
      attempts++;
    }

    this.state.currentPlayerIndex = nextIdx;
    this.state.turnNumber += 1;

    const nextPlayer = this.getCurrentPlayer();
    this.addLog(`👉 Turn ${this.state.turnNumber}: ${nextPlayer.name}'s turn!`, 'ROLL', nextPlayer.id);
    this.notify();

    this.triggerBotTurnIfNeeded();
  }

  public handleBankruptcy(bankruptPlayerId: string, creditorPlayerId: string | null, reason: string) {
    const player = this.state.players.find((p) => p.id === bankruptPlayerId);
    if (!player || player.isBankrupt) return;

    player.isBankrupt = true;
    player.cash = 0;

    const botDialogue = player.isBot ? BotAI.getBotDialogue(player.botPersonality, 'bankrupt') : undefined;
    this.addLog(
      `💀 ${player.name} went BANKRUPT (${reason})! Plot gaya, paisa gaya, izzat gayi!`,
      'BANKRUPT',
      player.id,
      botDialogue || 'دیوالیہ ہو گیا!'
    );

    if (creditorPlayerId) {
      const creditor = this.state.players.find((p) => p.id === creditorPlayerId);
      if (creditor) {
        // Transfer properties to creditor
        player.properties.forEach((idx) => {
          creditor.properties.push(idx);
          this.state.properties[idx].ownerId = creditor.id;
        });
        creditor.getOutOfJailCards += player.getOutOfJailCards;
        this.addLog(`📦 Transferred all assets of ${player.name} to ${creditor.name}!`, 'BANKRUPT', creditor.id);
      }
    } else {
      // Return properties to bank
      player.properties.forEach((idx) => {
        const ps = this.state.properties[idx];
        ps.ownerId = null;
        ps.houses = 0;
        ps.hasHotel = false;
        ps.isMortgaged = false;
      });
    }
    player.properties = [];
    player.getOutOfJailCards = 0;

    // Check winner
    const activePlayers = this.state.players.filter((p) => !p.isBankrupt);
    if (activePlayers.length === 1) {
      this.state.status = 'GAME_OVER';
      this.state.winnerId = activePlayers[0].id;
      this.addLog(
        `🏆 THE LAST TYCOON STANDING! ${activePlayers[0].name} has WON PLOT TWIST 🇵🇰!`,
        'CHAT',
        activePlayers[0].id,
        'بادشاہ سلامت!'
      );
    } else if (this.state.currentPlayerIndex === this.state.players.indexOf(player)) {
      this.advanceToNextPlayer();
    }
  }

  // AI Bot Automation
  private triggerBotTurnIfNeeded() {
    if (this.botTurnTimer) {
      clearTimeout(this.botTurnTimer);
      this.botTurnTimer = null;
    }

    if (this.state.status !== 'PLAYING') return;
    const player = this.getCurrentPlayer();
    if (!player || !player.isBot || player.isBankrupt) return;

    this.botTurnTimer = setTimeout(() => {
      this.executeBotTurn(player);
    }, 1200);
  }

  private executeBotTurn(player: Player) {
    if (this.state.status !== 'PLAYING' || this.getCurrentPlayer().id !== player.id) return;

    // 1. If in jail, handle bail/card
    if (player.inJail && !this.state.diceRolled) {
      if (player.getOutOfJailCards > 0) {
        this.useJailCard(player.id);
      } else if (BotAI.shouldPayBail(player, this.state)) {
        this.payBail(player.id);
      }
    }

    // 2. Roll dice if not rolled
    if (!this.state.diceRolled) {
      this.rollDice(player.id);
      return;
    }

    // 3. Check property buying decision
    const currentSpace = BOARD_SPACES[player.position];
    const propState = this.state.properties[currentSpace.index];

    if (['PROPERTY', 'TRANSPORT', 'UTILITY'].includes(currentSpace.type) && propState && !propState.ownerId) {
      if (BotAI.shouldBuyProperty(player, currentSpace.index, this.state)) {
        this.buyProperty(player.id);
      } else {
        this.declineBuyProperty(player.id);
        return;
      }
    }

    // 4. Try building or unmortgaging
    const buildable = BotAI.findBuildableProperty(player, this.state);
    if (buildable !== null) {
      this.buildHouse(player.id, buildable);
    }

    const unmortgageable = BotAI.findUnmortgageProperty(player, this.state);
    if (unmortgageable !== null) {
      this.unmortgageProperty(player.id, unmortgageable);
    }

    // 5. End Turn
    setTimeout(() => {
      if (this.getCurrentPlayer().id === player.id && this.state.status === 'PLAYING') {
        this.endTurn(player.id);
      }
    }, 1000);
  }

  private triggerBotAuctionBid() {
    if (this.state.status !== 'AUCTION' || !this.state.currentAuction) return;

    const auction = this.state.currentAuction;
    const botPlayers = this.state.players.filter(
      (p) => p.isBot && !p.isBankrupt && auction.activePlayerIds.includes(p.id)
    );

    botPlayers.forEach((bot) => {
      const bid = BotAI.getAuctionBid(bot, auction, this.state);
      if (bid !== null) {
        setTimeout(() => {
          if (this.state.status === 'AUCTION' && this.state.currentAuction) {
            this.placeAuctionBid(bot.id, bid);
          }
        }, 1000 + Math.random() * 2000);
      } else if (Math.random() < 0.4) {
        setTimeout(() => {
          if (this.state.status === 'AUCTION') {
            this.foldAuction(bot.id);
          }
        }, 3000);
      }
    });
  }
}
