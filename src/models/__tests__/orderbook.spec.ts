import { describe, it, expect, beforeEach } from 'vitest';
import { OrderBook, UserOrder } from '../orderbook';

describe('OrderBook', () => {
  let book: OrderBook;

  beforeEach(() => {
    book = new OrderBook();
  });

  it('adds limit buy order if no matching asks', () => {
    const buyOrder: UserOrder = {
      price: 100,
      quantity: 10,
      side: 'buy',
    };
    book.processOrder(buyOrder);
    const snapshot = book.getOrderBookSnapshot();
    console.log(snapshot.bids[0].orders);
    expect(snapshot.bids.length).toBe(1);
    expect(snapshot.bids[0].price).toBe(100);
    expect(snapshot.bids[0].totalQuantity).toBe(10);
    expect(snapshot.asks.length).toBe(0);
  });

  it('matches buy order against best ask with price-time priority and partial fills', () => {
    // First add some asks
    const ask1: UserOrder = { price: 100, quantity: 5, side: 'sell' };
    const ask2: UserOrder = { price: 100, quantity: 10, side: 'sell' };
    book.processOrder(ask1);
    book.processOrder(ask2);

    const buyOrder: UserOrder = { price: 100, quantity: 12, side: 'buy' };
    book.processOrder(buyOrder);

    const snapshot = book.getOrderBookSnapshot();
    console.log(snapshot.asks[0].orders);
    // After matching 12 units from asks price 100 (5 + 7 from second order partially)
    expect(snapshot.asks.length).toBe(1);
    expect(snapshot.asks[0].price).toBe(100);
    expect(snapshot.asks[0].totalQuantity).toBe(3); // 10 - 7 left in second ask
    expect(snapshot.bids.length).toBe(0); // Buy order fully matched
  });

  it('does not match buy order above limit price', () => {
    // Add ask at 105
    const ask: Order = { price: 105, quantity: 5, side: 'sell' };
    book.processOrder(ask);

    // Buy order with max price 100 should not match
    const buyOrder: Order = { price: 100, quantity: 5, side: 'buy' };
    book.processOrder(buyOrder);

    const snapshot = book.getOrderBookSnapshot();
    expect(snapshot.asks.length).toBe(1);
    expect(snapshot.asks[0].totalQuantity).toBe(5);
    expect(snapshot.bids.length).toBe(1);
    expect(snapshot.bids[0].totalQuantity).toBe(5);
  });

  it('allows multiple price levels with correct matching order', () => {
    // Add asks at 99 and 100
    book.processOrder({ price: 100, quantity: 5, side: 'sell' });
    book.processOrder({ price: 99, quantity: 5, side: 'sell' });

    // Buy order at 100 quantity 6 should fill 5 at 99, 1 at 100
    book.processOrder({ price: 100, quantity: 6, side: 'buy' });

    const snapshot = book.getOrderBookSnapshot();

    expect(snapshot.asks.length).toBe(1);
    expect(snapshot.asks[0].price).toBe(100);
    expect(snapshot.asks[0].totalQuantity).toBe(4); // 5 -1 left at 100

    expect(snapshot.bids.length).toBe(0);
  });
});