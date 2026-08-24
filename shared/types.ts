export type CityGroup =
  | 'RAWALPINDI'
  | 'LAHORE'
  | 'PESHAWAR'
  | 'MULTAN'
  | 'FAISALABAD'
  | 'MURREE'
  | 'KARACHI'
  | 'ISLAMABAD';

export type SpaceType =
  | 'START'
  | 'PROPERTY'
  | 'TRANSPORT'
  | 'UTILITY'
  | 'TAX'
  | 'CARD_SCENE_ON_HAI'
  | 'CARD_PAKISTAN_ZINDABAD'
  | 'JAIL'
  | 'JUST_VISITING'
  | 'FREE_PARKING'
  | 'GO_TO_JAIL';

export interface BoardSpace {
  index: number;
  name: string;
  urduName?: string;
  type: SpaceType;
  cityGroup?: CityGroup;
  colorHex?: string;
  price?: number;
  rent?: number;
  rentWithSet?: number;
  rentWith1House?: number;
  rentWith2Houses?: number;
  rentWith3Houses?: number;
  rentWith4Houses?: number;
  rentWithHotel?: number;
  houseCost?: number;
  hotelCost?: number;
  mortgageValue?: number;
  taxAmount?: number;
  transportIndex?: number;
  utilityType?: 'WAPDA' | 'SUI_GAS';
  icon?: string;
  description?: string;
}

export interface Player {
  id: string;
  socketId: string;
  name: string;
  avatar: string;
  token: string;
  tokenEmoji: string;
  color: string;
  cash: number;
  position: number;
  properties: number[]; // Space indices
  getOutOfJailCards: number;
  inJail: boolean;
  jailTurns: number;
  isBankrupt: boolean;
  isBot: boolean;
  botDifficulty?: 'EASY' | 'NORMAL' | 'HARD';
  botPersonality?: string;
  connected: boolean;
}

export interface PropertyState {
  spaceIndex: number;
  ownerId: string | null;
  houses: number; // 0-4
  hasHotel: boolean;
  isMortgaged: boolean;
}

export interface Card {
  id: number;
  deck: 'SCENE_ON_HAI' | 'PAKISTAN_ZINDABAD';
  title: string;
  urduTitle?: string;
  description: string;
  actionText: string;
  illustration: string;
  actionType:
    | 'MONEY_ADD'
    | 'MONEY_SUBTRACT'
    | 'COLLECT_FROM_ALL'
    | 'PAY_TO_ALL'
    | 'PAY_TO_BANK'
    | 'MOVE_TO'
    | 'GO_TO_JAIL'
    | 'GET_OUT_OF_JAIL'
    | 'MISS_TURN'
    | 'BIRYANI_DICE_ROLL'
    | 'REMOVE_BUILDING_OR_TRANSFER'
    | 'PER_BUILDING_ASSESSMENT'
    | 'SPECIAL_NEW_YORK';
  amount?: number;
  targetPosition?: number;
  perHouseCost?: number;
  perHotelCost?: number;
}

export interface GameSettings {
  startingMoney: number;
  salaryOnStart: number;
  auctionsEnabled: boolean;
  forcedAuctions: boolean;
  mortgagesEnabled: boolean;
  mortgageInterest: number; // decimal e.g. 0.10 for 10%
  evenBuild: boolean;
  freeParkingMode: 'NONE' | 'FIXED' | 'POT';
  freeParkingAmount: number;
  maxJailTurns: number;
  jailBail: number;
  doublesExtraTurn: boolean;
  tripleDoublesJail: boolean;
  housesAvailable: number;
  hotelsAvailable: number;
  housesForHotel: number;
  turnTimeoutSeconds: number;
}

export interface AuctionState {
  propertyIndex: number;
  highestBid: number;
  highestBidderId: string | null;
  activePlayerIds: string[];
  currentBidderIndex: number;
  timerSeconds: number;
  startedAt: number;
}

export interface TradeOffer {
  id: string;
  fromPlayerId: string;
  toPlayerId: string;
  offeredCash: number;
  offeredProperties: number[];
  offeredJailCards: number;
  requestedCash: number;
  requestedProperties: number[];
  requestedJailCards: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
}

export interface GameLogEntry {
  id: string;
  timestamp: number;
  text: string;
  urduFlavor?: string;
  type: 'ROLL' | 'MOVE' | 'BUY' | 'RENT' | 'CARD' | 'BUILD' | 'MORTGAGE' | 'TRADE' | 'JAIL' | 'BANKRUPT' | 'CHAT' | 'BOT_THINK';
  playerId?: string;
}

export type GameStatus = 'LOBBY' | 'PLAYING' | 'AUCTION' | 'PAUSED' | 'GAME_OVER';

export interface GameState {
  roomCode: string;
  roomName: string;
  hostId: string;
  status: GameStatus;
  settings: GameSettings;
  players: Player[];
  currentPlayerIndex: number;
  turnNumber: number;
  consecutiveDoubles: number;
  lastDice: [number, number];
  diceRolled: boolean;
  hasMovedThisTurn: boolean;
  properties: Record<number, PropertyState>;
  availableHouses: number;
  availableHotels: number;
  freeParkingPot: number;
  currentAuction: AuctionState | null;
  activeTrade: TradeOffer | null;
  lastCardDrawn: Card | null;
  winnerId: string | null;
  logs: GameLogEntry[];
}

export interface BotPersonality {
  name: string;
  avatar: string;
  token: string;
  tokenEmoji: string;
  difficulty: 'EASY' | 'NORMAL' | 'HARD';
  tagline: string;
  dialogues: {
    buy: string[];
    rentPaid: string[];
    rentCollected: string[];
    bankrupt: string[];
  };
}
