import { GameState, Player, PropertyState, AuctionState } from '../../../shared/types.js';
import { BOARD_SPACES, CITY_GROUP_MEMBERS, TRANSPORT_SPACES, UTILITY_SPACES } from '../../../shared/boardData.js';
import { BOT_PERSONALITIES } from '../../../shared/defaultSettings.js';

export interface BotDecision {
  action: 'ROLL' | 'BUY' | 'DECLINE_BUY' | 'PAY_BAIL' | 'USE_JAIL_CARD' | 'BUILD' | 'MORTGAGE' | 'UNMORTGAGE' | 'END_TURN';
  targetSpaceIndex?: number;
  bidAmount?: number;
  dialogue?: string;
}

export class BotAI {
  public static shouldPayBail(player: Player, state: GameState): boolean {
    if (!player.inJail) return false;
    if (player.getOutOfJailCards > 0) return false; // will use card instead
    if (player.cash > state.settings.jailBail * 4 && player.jailTurns >= 2) {
      return true;
    }
    return false;
  }

  public static shouldBuyProperty(player: Player, spaceIndex: number, state: GameState): boolean {
    const space = BOARD_SPACES[spaceIndex];
    if (!space || !space.price) return false;
    if (player.cash < space.price) return false;

    const remainingCash = player.cash - space.price;
    const difficulty = player.botDifficulty || 'NORMAL';

    if (difficulty === 'EASY') {
      return remainingCash >= 50 && Math.random() < 0.8;
    }

    // Check if buying completes a city group
    if (space.cityGroup) {
      const groupIndices = CITY_GROUP_MEMBERS[space.cityGroup];
      const ownedInGroup = groupIndices.filter((idx) => player.properties.includes(idx));
      // Completing the set!
      if (ownedInGroup.length === groupIndices.length - 1) {
        return true;
      }
    }

    if (TRANSPORT_SPACES.includes(spaceIndex) || UTILITY_SPACES.includes(spaceIndex)) {
      return remainingCash >= 80;
    }

    if (difficulty === 'HARD') {
      // Islamabad / Karachi / Faisalabad high priority
      if (['ISLAMABAD', 'KARACHI', 'FAISALABAD'].includes(space.cityGroup || '')) {
        return remainingCash >= 40;
      }
      return remainingCash >= 100;
    }

    // NORMAL
    return remainingCash >= 150;
  }

  public static getAuctionBid(player: Player, auction: AuctionState, state: GameState): number | null {
    const space = BOARD_SPACES[auction.propertyIndex];
    if (!space || !space.price) return null;

    const currentBid = auction.highestBid;
    const maxAffordable = player.cash - 100; // retain safety cushion
    if (maxAffordable <= currentBid) return null;

    const isHighestBidder = auction.highestBidderId === player.id;
    if (isHighestBidder) return null;

    let valuation = space.price;
    // If completing a set, willing to bid up to 1.5x face value
    if (space.cityGroup) {
      const groupIndices = CITY_GROUP_MEMBERS[space.cityGroup];
      const owned = groupIndices.filter((idx) => player.properties.includes(idx));
      if (owned.length === groupIndices.length - 1) {
        valuation = Math.floor(space.price * 1.5);
      }
    }

    const nextBid = currentBid + 10;
    if (nextBid <= valuation && nextBid <= maxAffordable) {
      return nextBid;
    }

    return null;
  }

  public static findBuildableProperty(player: Player, state: GameState): number | null {
    if (player.cash < 250) return null; // keep safety cash
    if (state.availableHouses <= 0 && state.availableHotels <= 0) return null;

    for (const [groupName, indices] of Object.entries(CITY_GROUP_MEMBERS)) {
      const allOwned = indices.every((idx) => player.properties.includes(idx));
      if (!allOwned) continue;

      // Check all unmortgaged
      const allUnmortgaged = indices.every((idx) => !state.properties[idx]?.isMortgaged);
      if (!allUnmortgaged) continue;

      // Find property with least houses (even building rule)
      let minHouses = 5;
      let targetIdx: number | null = null;

      for (const idx of indices) {
        const p = state.properties[idx];
        const count = p.hasHotel ? 5 : p.houses;
        if (count < minHouses) {
          minHouses = count;
          targetIdx = idx;
        }
      }

      if (targetIdx !== null && minHouses < 5) {
        const space = BOARD_SPACES[targetIdx];
        const cost = minHouses === 4 ? space.hotelCost || 100 : space.houseCost || 50;
        if (player.cash - cost >= 150) {
          return targetIdx;
        }
      }
    }

    return null;
  }

  public static findUnmortgageProperty(player: Player, state: GameState): number | null {
    if (player.cash < 400) return null;

    for (const propIdx of player.properties) {
      const p = state.properties[propIdx];
      if (p && p.isMortgaged) {
        const space = BOARD_SPACES[propIdx];
        const unmortgageCost = Math.floor((space.mortgageValue || 50) * (1 + state.settings.mortgageInterest));
        if (player.cash - unmortgageCost >= 200) {
          return propIdx;
        }
      }
    }
    return null;
  }

  public static getBotDialogue(personalityName: string | undefined, eventType: 'buy' | 'rentPaid' | 'rentCollected' | 'bankrupt'): string | undefined {
    const personality = BOT_PERSONALITIES.find((b) => b.name === personalityName) || BOT_PERSONALITIES[0];
    const pool = personality.dialogues[eventType];
    if (pool && pool.length > 0) {
      return pool[Math.floor(Math.random() * pool.length)];
    }
    return undefined;
  }
}
