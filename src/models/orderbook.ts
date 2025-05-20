export type Side = 'buy' | 'sell';

export interface Order {
  id: string;
  price: number;
  quantity: number;
  timestamp: number;
  side: Side;
  isMarket?: boolean; // TODO
}

export interface UserOrder {
  price: number;
  quantity: number;
  side: Side;
  isMarket?: boolean; // TODO
}

interface OrderQueue {
  orders: Order[];
  totalQuantity: number;
}

export class OrderBook {
  private bids: Map<number, OrderQueue> = new Map(); // key: price, value: FIFO queue for that price
  private asks: Map<number, OrderQueue> = new Map();
  private orderIdCounter: number = 0;

  constructor() {}

  private getNextOrderId(): string {
    this.orderIdCounter += 1;
    return this.orderIdCounter.toString();
  }

  private getCurrentTimestamp(): number {
    return Date.now();
  }

  private getSortedPrices(side: Side): number[] {
    const prices = [...(side === 'buy' ? this.bids.keys() : this.asks.keys())];
    return side === 'buy'
      ? prices.sort((a, b) => b - a) // Descending for bids
      : prices.sort((a, b) => a - b); // Ascending for asks
  }

  // Add order to orderbook side queue
  private addOrderToBook(order: Order) {
    const bookSide = order.side === 'buy' ? this.bids : this.asks;
    let queue = bookSide.get(order.price);
    if (!queue) {
      queue = { orders: [], totalQuantity: 0 };
      bookSide.set(order.price, queue);
    }
    queue.orders.push(order);
    queue.totalQuantity += order.quantity;
  }

  // Remove filled or empty orders from order queues
  private cleanOrderQueue(side: Side, price: number) {
    const bookSide = side === 'buy' ? this.bids : this.asks;
    const queue = bookSide.get(price);
    if (queue) {
      queue.orders = queue.orders.filter(order => order.quantity > 0);
      queue.totalQuantity = queue.orders.reduce((acc, o) => acc + o.quantity, 0);
      if (queue.orders.length === 0) {
        bookSide.delete(price);
      }
    }
  }

  // Core matching logic for incoming order
  public processOrder(userOrder: UserOrder) {
    const incoming: Order = {
      ...userOrder,
      id: this.getNextOrderId(),
      timestamp: this.getCurrentTimestamp(),
    };

    const oppositeSide = incoming.side === 'buy' ? 'sell' : 'buy';
    const bookSide = oppositeSide === 'buy' ? this.bids : this.asks;

    // Get sorted prices to match against (best price first)
    const sortedPrices = this.getSortedPrices(oppositeSide);

    let qtyToFill = incoming.quantity;

    for (const price of sortedPrices) {
      // Price matching condition depends on sides:
      if (
        (incoming.side === 'buy' && price > incoming.price) || // can't buy above limit price
        (incoming.side === 'sell' && price < incoming.price) // can't sell below limit price
      ) {
        break; // prices too far, stop matching
      }

      const queue = bookSide.get(price);
      if (!queue) continue;

      // Iterate FIFO in price queue
      for (const existingOrder of queue.orders) {
        if (qtyToFill <= 0) break;

        const fillQty = Math.min(qtyToFill, existingOrder.quantity);
        existingOrder.quantity -= fillQty;
        qtyToFill -= fillQty;

        queue.totalQuantity -= fillQty;

        // Here you might emit fill events or update trade history

        if (existingOrder.quantity === 0) {
          // fully filled order removed on clean up
          // optional: track order completion
        }
      }

      this.cleanOrderQueue(oppositeSide, price);

      if (qtyToFill === 0) break;
    }

    // If leftover quantity, add to own side as limit order
    if (qtyToFill > 0) {
      const leftoverOrder: Order = {
        ...incoming,
        quantity: qtyToFill,
      };
      this.addOrderToBook(leftoverOrder);
    }
  }

  // Accessors for UI or charting
  public getOrderBookSnapshot() {
    const bids = this.getSortedPrices('buy').map(price => {
      const q = this.bids.get(price);
      return {
        price,
        totalQuantity: q?.totalQuantity ?? 0,
        orders: q?.orders ?? [],
      };
    });

    const asks = this.getSortedPrices('sell').map(price => {
      const q = this.asks.get(price);
      return {
        price,
        totalQuantity: q?.totalQuantity ?? 0,
        orders: q?.orders ?? [],
      };
    });

    return { bids, asks };
  }
}
