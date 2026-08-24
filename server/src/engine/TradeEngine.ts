import { Player, PropertyState, TradeOffer } from '../../../shared/types.js';

export class TradeEngine {
  private activeTrades: Map<string, TradeOffer> = new Map();

  public createOffer(
    fromPlayer: Player,
    toPlayer: Player,
    offeredCash: number,
    offeredProperties: number[],
    offeredJailCards: number,
    requestedCash: number,
    requestedProperties: number[],
    requestedJailCards: number,
    propertiesState: Record<number, PropertyState>
  ): { success: boolean; error?: string; offer?: TradeOffer } {
    if (fromPlayer.id === toPlayer.id) {
      return { success: false, error: 'Cannot trade with yourself' };
    }

    if (fromPlayer.cash < offeredCash || offeredCash < 0) {
      return { success: false, error: 'Invalid offered cash amount' };
    }

    if (toPlayer.cash < requestedCash || requestedCash < 0) {
      return { success: false, error: 'Target player does not have requested cash' };
    }

    if (fromPlayer.getOutOfJailCards < offeredJailCards || offeredJailCards < 0) {
      return { success: false, error: 'Invalid offered jail cards' };
    }

    if (toPlayer.getOutOfJailCards < requestedJailCards || requestedJailCards < 0) {
      return { success: false, error: 'Target player does not have requested jail cards' };
    }

    // Verify properties ownership
    for (const propIdx of offeredProperties) {
      if (!fromPlayer.properties.includes(propIdx)) {
        return { success: false, error: `You do not own space ${propIdx}` };
      }
      const pState = propertiesState[propIdx];
      if (pState && (pState.houses > 0 || pState.hasHotel)) {
        return { success: false, error: 'Cannot trade properties with active houses or hotels. Sell them first.' };
      }
    }

    for (const propIdx of requestedProperties) {
      if (!toPlayer.properties.includes(propIdx)) {
        return { success: false, error: `Target player does not own space ${propIdx}` };
      }
      const pState = propertiesState[propIdx];
      if (pState && (pState.houses > 0 || pState.hasHotel)) {
        return { success: false, error: 'Target property has active houses/hotels' };
      }
    }

    const offerId = `trade_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const tradeOffer: TradeOffer = {
      id: offerId,
      fromPlayerId: fromPlayer.id,
      toPlayerId: toPlayer.id,
      offeredCash,
      offeredProperties,
      offeredJailCards,
      requestedCash,
      requestedProperties,
      requestedJailCards,
      status: 'PENDING',
    };

    this.activeTrades.set(offerId, tradeOffer);
    return { success: true, offer: tradeOffer };
  }

  public getOffer(offerId: string): TradeOffer | undefined {
    return this.activeTrades.get(offerId);
  }

  public cancelOffer(offerId: string): boolean {
    const offer = this.activeTrades.get(offerId);
    if (offer) {
      offer.status = 'CANCELLED';
      this.activeTrades.delete(offerId);
      return true;
    }
    return false;
  }

  public executeTrade(
    offerId: string,
    fromPlayer: Player,
    toPlayer: Player,
    propertiesState: Record<number, PropertyState>
  ): { success: boolean; error?: string } {
    const offer = this.activeTrades.get(offerId);
    if (!offer) return { success: false, error: 'Trade offer not found' };

    // Re-verify funds & property ownership at execution time
    if (fromPlayer.cash < offer.offeredCash || toPlayer.cash < offer.requestedCash) {
      return { success: false, error: 'Insufficient cash to execute trade' };
    }

    if (fromPlayer.getOutOfJailCards < offer.offeredJailCards || toPlayer.getOutOfJailCards < offer.requestedJailCards) {
      return { success: false, error: 'Insufficient jail cards to execute trade' };
    }

    for (const propIdx of offer.offeredProperties) {
      if (!fromPlayer.properties.includes(propIdx)) {
        return { success: false, error: 'Offered property no longer owned' };
      }
    }

    for (const propIdx of offer.requestedProperties) {
      if (!toPlayer.properties.includes(propIdx)) {
        return { success: false, error: 'Requested property no longer owned' };
      }
    }

    // Execute Cash transfer
    fromPlayer.cash -= offer.offeredCash;
    toPlayer.cash += offer.offeredCash;

    toPlayer.cash -= offer.requestedCash;
    fromPlayer.cash += offer.requestedCash;

    // Execute Jail cards transfer
    fromPlayer.getOutOfJailCards -= offer.offeredJailCards;
    toPlayer.getOutOfJailCards += offer.offeredJailCards;

    toPlayer.getOutOfJailCards -= offer.requestedJailCards;
    fromPlayer.getOutOfJailCards += offer.requestedJailCards;

    // Transfer Offered Properties: fromPlayer -> toPlayer
    for (const propIdx of offer.offeredProperties) {
      fromPlayer.properties = fromPlayer.properties.filter((idx) => idx !== propIdx);
      toPlayer.properties.push(propIdx);
      if (propertiesState[propIdx]) {
        propertiesState[propIdx].ownerId = toPlayer.id;
      }
    }

    // Transfer Requested Properties: toPlayer -> fromPlayer
    for (const propIdx of offer.requestedProperties) {
      toPlayer.properties = toPlayer.properties.filter((idx) => idx !== propIdx);
      fromPlayer.properties.push(propIdx);
      if (propertiesState[propIdx]) {
        propertiesState[propIdx].ownerId = fromPlayer.id;
      }
    }

    offer.status = 'ACCEPTED';
    this.activeTrades.delete(offerId);
    return { success: true };
  }
}
