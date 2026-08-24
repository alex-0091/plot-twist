import { AuctionState, Player } from '../../../shared/types.js';

export class AuctionEngine {
  public auction: AuctionState | null = null;
  private timerHandle: NodeJS.Timeout | null = null;
  private onAuctionEndCallback: ((winnerId: string | null, finalBid: number, propertyIndex: number) => void) | null = null;
  private onTickCallback: ((auction: AuctionState) => void) | null = null;

  public startAuction(
    propertyIndex: number,
    players: Player[],
    onTick: (auction: AuctionState) => void,
    onEnd: (winnerId: string | null, finalBid: number, propertyIndex: number) => void
  ) {
    this.stopTimer();

    const activePlayerIds = players.filter((p) => !p.isBankrupt && p.cash > 0).map((p) => p.id);

    this.auction = {
      propertyIndex,
      highestBid: 0,
      highestBidderId: null,
      activePlayerIds,
      currentBidderIndex: 0,
      timerSeconds: 15,
      startedAt: Date.now(),
    };

    this.onTickCallback = onTick;
    this.onAuctionEndCallback = onEnd;

    this.startTimer();
    this.onTickCallback(this.auction);
  }

  public placeBid(playerId: string, bidAmount: number, playerCash: number): { success: boolean; message?: string } {
    if (!this.auction) {
      return { success: false, message: 'No active auction' };
    }

    if (!this.auction.activePlayerIds.includes(playerId)) {
      return { success: false, message: 'You are not active in this auction' };
    }

    if (bidAmount <= this.auction.highestBid) {
      return { success: false, message: `Bid must be higher than current Rs ${this.auction.highestBid}` };
    }

    if (bidAmount > playerCash) {
      return { success: false, message: 'You do not have enough cash for this bid' };
    }

    this.auction.highestBid = bidAmount;
    this.auction.highestBidderId = playerId;
    // Reset timer on new highest bid
    this.auction.timerSeconds = 12;

    if (this.onTickCallback) {
      this.onTickCallback(this.auction);
    }

    return { success: true };
  }

  public foldPlayer(playerId: string): { success: boolean } {
    if (!this.auction) return { success: false };

    this.auction.activePlayerIds = this.auction.activePlayerIds.filter((id) => id !== playerId);

    if (this.auction.activePlayerIds.length <= 1 && this.auction.highestBidderId) {
      this.finishAuction();
    } else if (this.auction.activePlayerIds.length === 0) {
      this.finishAuction();
    } else if (this.onTickCallback) {
      this.onTickCallback(this.auction);
    }

    return { success: true };
  }

  private startTimer() {
    this.timerHandle = setInterval(() => {
      if (!this.auction) {
        this.stopTimer();
        return;
      }

      this.auction.timerSeconds -= 1;

      if (this.auction.timerSeconds <= 0) {
        this.finishAuction();
      } else if (this.onTickCallback) {
        this.onTickCallback(this.auction);
      }
    }, 1000);
  }

  private stopTimer() {
    if (this.timerHandle) {
      clearInterval(this.timerHandle);
      this.timerHandle = null;
    }
  }

  private finishAuction() {
    this.stopTimer();
    if (!this.auction) return;

    const winnerId = this.auction.highestBidderId;
    const finalBid = this.auction.highestBid;
    const propIdx = this.auction.propertyIndex;

    this.auction = null;

    if (this.onAuctionEndCallback) {
      this.onAuctionEndCallback(winnerId, finalBid, propIdx);
    }
  }

  public cancel() {
    this.stopTimer();
    this.auction = null;
  }
}
