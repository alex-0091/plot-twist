import { Card, Player, PropertyState } from '../../../shared/types.js';
import { ALL_CARDS } from '../../../shared/cardsData.js';
import { BOARD_SPACES } from '../../../shared/boardData.js';

export interface CardExecutionResult {
  card: Card;
  logMessage: string;
  urduFlavor: string;
  moneyDeltas: Record<string, number>; // playerId -> delta
  positionChange?: number;
  sentToJail?: boolean;
  missTurn?: boolean;
  transferredProperty?: { spaceIndex: number; fromPlayerId: string; toPlayerId: string };
  removedBuilding?: { spaceIndex: number; type: 'HOUSE' | 'HOTEL' };
  rolls?: [number, number];
}

export class CardEngine {
  private sceneOnHaiDeck: Card[] = [];
  private pakistanZindabadDeck: Card[] = [];

  constructor() {
    this.resetDecks();
  }

  public resetDecks() {
    this.sceneOnHaiDeck = this.shuffle(ALL_CARDS.filter((c) => c.deck === 'SCENE_ON_HAI'));
    this.pakistanZindabadDeck = this.shuffle(ALL_CARDS.filter((c) => c.deck === 'PAKISTAN_ZINDABAD'));
  }

  private shuffle(array: Card[]): Card[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  public drawCard(deckType: 'SCENE_ON_HAI' | 'PAKISTAN_ZINDABAD'): Card {
    const deck = deckType === 'SCENE_ON_HAI' ? this.sceneOnHaiDeck : this.pakistanZindabadDeck;
    if (deck.length === 0) {
      this.resetDecks();
    }
    const targetDeck = deckType === 'SCENE_ON_HAI' ? this.sceneOnHaiDeck : this.pakistanZindabadDeck;
    const card = targetDeck.shift()!;
    targetDeck.push(card);
    return card;
  }

  public executeCard(
    card: Card,
    player: Player,
    allPlayers: Player[],
    properties: Record<number, PropertyState>,
    salaryOnStart: number = 200
  ): CardExecutionResult {
    const moneyDeltas: Record<string, number> = {};
    allPlayers.forEach((p) => (moneyDeltas[p.id] = 0));

    let logMessage = `${player.name} drew "${card.title}"! ${card.actionText}`;
    let urduFlavor = card.urduTitle || 'سین آن ہے!';
    let positionChange: number | undefined;
    let sentToJail = false;
    let missTurn = false;
    let transferredProperty: { spaceIndex: number; fromPlayerId: string; toPlayerId: string } | undefined;
    let removedBuilding: { spaceIndex: number; type: 'HOUSE' | 'HOTEL' } | undefined;
    let rolls: [number, number] | undefined;

    switch (card.id) {
      // 1: RAJA HAS ARRIVED
      case 1: {
        const playerProps = player.properties.map((idx) => properties[idx]).filter(Boolean);
        const propWithHotel = playerProps.find((p) => p.hasHotel);
        const propWithHouse = playerProps.find((p) => p.houses > 0);

        if (propWithHotel) {
          propWithHotel.hasHotel = false;
          propWithHotel.houses = 4;
          removedBuilding = { spaceIndex: propWithHotel.spaceIndex, type: 'HOTEL' };
          logMessage = `👑 Raja arrived! A hotel on ${BOARD_SPACES[propWithHotel.spaceIndex].name} was knocked down to 4 houses!`;
        } else if (propWithHouse) {
          propWithHouse.houses -= 1;
          removedBuilding = { spaceIndex: propWithHouse.spaceIndex, type: 'HOUSE' };
          logMessage = `👑 Raja arrived! Removed 1 house from ${BOARD_SPACES[propWithHouse.spaceIndex].name}!`;
        } else if (player.properties.length > 0) {
          const otherActivePlayers = allPlayers.filter((p) => p.id !== player.id && !p.isBankrupt);
          if (otherActivePlayers.length > 0) {
            const randomTarget = otherActivePlayers[Math.floor(Math.random() * otherActivePlayers.length)];
            const randomPropIndex = player.properties[Math.floor(Math.random() * player.properties.length)];
            transferredProperty = {
              spaceIndex: randomPropIndex,
              fromPlayerId: player.id,
              toPlayerId: randomTarget.id,
            };
            logMessage = `👑 Raja gave ${BOARD_SPACES[randomPropIndex].name} to ${randomTarget.name}! Qabza mafia strike!`;
          }
        } else {
          logMessage = `👑 Raja looked around, but ${player.name} has nothing to seize!`;
        }
        break;
      }

      // 2: KHOKHAR ROYALTY
      case 2: {
        let totalCollected = 0;
        allPlayers.forEach((other) => {
          if (other.id !== player.id && !other.isBankrupt) {
            moneyDeltas[other.id] -= 50;
            totalCollected += 50;
          }
        });
        moneyDeltas[player.id] += totalCollected;
        logMessage = `🏰 Khokhar royalty collected Rs 50 from all players (Total Rs ${totalCollected})!`;
        break;
      }

      // 3: POLICE BRIBING
      case 3:
      // 7: PATWARI PROBLEM
      case 7:
      // 15: TRAFFIC POLICE
      case 15:
      // 18: MEHMAAN AA GAYE
      case 18:
      // 20: PETROL PRICES
      case 20:
      // 23: GIRLFRIEND SCAMMED YOU
      case 23: {
        const amt = card.amount || 50;
        moneyDeltas[player.id] -= amt;
        break;
      }

      // 4: MET A LAHORI (GO TO JAIL)
      case 4: {
        sentToJail = true;
        logMessage = `🚔 ${player.name} trusted Lahori directions and ended up locked in THANA!`;
        break;
      }

      // 5: ARMY CHECKPOINT
      case 5: {
        allPlayers.forEach((other) => {
          if (other.id !== player.id && !other.isBankrupt) {
            moneyDeltas[other.id] -= 20;
          }
        });
        logMessage = `🪖 Security Checkpoint! Every other player paid Rs 20 to the Bank.`;
        break;
      }

      // 6: FBR
      case 6:
      // 8: WEDDING SEASON
      case 8:
      // 21: FATHER'S CAR
      case 21:
      // 24: FATHER HAS HAD ENOUGH
      case 24: {
        const amt = card.amount || 100;
        moneyDeltas[player.id] -= amt;
        break;
      }

      // 9: DHA DEVELOPMENT
      case 9:
      // 10: POLITICAL CONNECTION
      case 10:
      // 19: EID ENVELOPE
      case 19: {
        const amt = card.amount || 100;
        moneyDeltas[player.id] += amt;
        break;
      }

      // 11: BIJLI KA BILL
      case 11: {
        moneyDeltas[player.id] -= 75;
        break;
      }

      // 12: LOAD SHEDDING
      case 12:
      // 16: NADRA QUEUE
      case 16: {
        missTurn = true;
        logMessage = `⏳ ${player.name} will miss their next turn (${card.title})!`;
        break;
      }

      // 13: BIRYANI DEBATE
      case 13: {
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        rolls = [d1, d2];
        const total = d1 + d2;
        if (total % 2 === 0) {
          moneyDeltas[player.id] += 50;
          logMessage = `🍚 Biryani Debate: Rolled ${total} (EVEN)! Collect Rs 50! Karachi Biryani wins!`;
        } else {
          moneyDeltas[player.id] -= 50;
          logMessage = `🍚 Biryani Debate: Rolled ${total} (ODD)! Pay Rs 50! Elaichi spotted in bite!`;
        }
        break;
      }

      // 14: CHAI FOR EVERYONE
      case 14: {
        let totalPaid = 0;
        allPlayers.forEach((other) => {
          if (other.id !== player.id && !other.isBankrupt) {
            moneyDeltas[other.id] += 20;
            totalPaid += 20;
          }
        });
        moneyDeltas[player.id] -= totalPaid;
        logMessage = `☕ Chai for everyone! ${player.name} treated all players (Paid Rs ${totalPaid})!`;
        break;
      }

      // 17: COUSIN IN GOVERNMENT (Get out of jail card)
      case 17: {
        player.getOutOfJailCards += 1;
        logMessage = `⚖️ ${player.name} acquired a "Get Out of Thana Free" card from their Cousin in Government!`;
        break;
      }

      // 22: QUETTA CAFÉ — ISLAMABAD (Go to New York - Jump 10 spaces)
      case 22: {
        const newPos = (player.position + 10) % 40;
        positionChange = newPos;
        if (newPos < player.position) {
          moneyDeltas[player.id] += salaryOnStart;
          logMessage = `✈️ Quetta Café chai was so strong ${player.name} warped 10 spaces forward to ${BOARD_SPACES[newPos].name} and passed START (+Rs ${salaryOnStart})!`;
        } else {
          logMessage = `✈️ Quetta Café tea fueled a 10-space jump straight to ${BOARD_SPACES[newPos].name}!`;
        }
        break;
      }

      // 25: ARMY KID SPECIAL PRIVILEGE (Move to START + Rs 200)
      case 25: {
        positionChange = 0;
        moneyDeltas[player.id] += salaryOnStart;
        logMessage = `🎖️ VIP Green Protocol! ${player.name} moved directly to START and collected Rs ${salaryOnStart}!`;
        break;
      }

      // 26: GOLD LEAF BREAK
      case 26: {
        moneyDeltas[player.id] -= 20;
        break;
      }

      // 27, 28, 29: Building assessments
      case 27:
      case 28:
      case 29: {
        let housesCount = 0;
        let hotelsCount = 0;
        player.properties.forEach((propIdx) => {
          const prop = properties[propIdx];
          if (prop) {
            if (prop.hasHotel) hotelsCount++;
            else housesCount += prop.houses;
          }
        });
        const totalTax = housesCount * 25 + hotelsCount * 50;
        moneyDeltas[player.id] -= totalTax;
        logMessage = `🏘️ ${card.title}: ${player.name} owns ${housesCount} houses & ${hotelsCount} hotels. Paid Rs ${totalTax}!`;
        break;
      }

      default:
        break;
    }

    return {
      card,
      logMessage,
      urduFlavor,
      moneyDeltas,
      positionChange,
      sentToJail,
      missTurn,
      transferredProperty,
      removedBuilding,
      rolls,
    };
  }
}
