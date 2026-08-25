import { GameState, Player } from '../types';
import { BOARD_SPACES, CITY_GROUP_MEMBERS, TRANSPORT_SPACES, UTILITY_SPACES } from '../types';

export class BotEngine {
  public static shouldPayBail(bot: Player, state: GameState): boolean {
    if (!bot.inJail) return false;
    if (bot.getOutOfJailCards > 0) return false;
    if (bot.cash >= state.settings.jailBail * 4 && bot.jailTurns >= 2) {
      return true;
    }
    return false;
  }

  public static shouldBuyProperty(bot: Player, spaceIndex: number, state: GameState): boolean {
    const space = BOARD_SPACES[spaceIndex];
    if (!space || !space.price) return false;
    if (bot.cash < space.price) return false;

    const remainingCash = bot.cash - space.price;
    const difficulty = bot.botDifficulty || 'NORMAL';

    if (difficulty === 'EASY') {
      return remainingCash >= 50 && Math.random() < 0.85;
    }

    // Check if completing a city group (highest priority)
    if (space.cityGroup) {
      const groupIndices = CITY_GROUP_MEMBERS[space.cityGroup] || [];
      const ownedInGroup = groupIndices.filter((idx) => bot.properties.includes(idx));
      if (ownedInGroup.length === groupIndices.length - 1) {
        return true;
      }
    }

    if (TRANSPORT_SPACES.includes(spaceIndex) || UTILITY_SPACES.includes(spaceIndex)) {
      return remainingCash >= 60;
    }

    if (difficulty === 'HARD') {
      if (['ISLAMABAD', 'KARACHI', 'FAISALABAD'].includes(space.cityGroup || '')) {
        return remainingCash >= 30;
      }
      return remainingCash >= 80;
    }

    // NORMAL
    return remainingCash >= 100;
  }

  public static findBuildableProperty(bot: Player, state: GameState): number | null {
    if (bot.cash < 200) return null;
    if (state.availableHouses <= 0 && state.availableHotels <= 0) return null;

    for (const [groupName, indices] of Object.entries(CITY_GROUP_MEMBERS)) {
      const allOwned = indices.every((idx) => bot.properties.includes(idx));
      if (!allOwned) continue;

      const allUnmortgaged = indices.every((idx) => !state.properties[idx]?.isMortgaged);
      if (!allUnmortgaged) continue;

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
        if (bot.cash - cost >= 100) {
          return targetIdx;
        }
      }
    }

    return null;
  }
}
