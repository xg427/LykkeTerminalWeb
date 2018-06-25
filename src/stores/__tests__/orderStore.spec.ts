import {Order, Side} from '../../models';
import {OrderStore, RootStore} from '../index';

describe('order store', () => {
  const api: any = {};
  const orderStore: OrderStore = new OrderStore(new RootStore(), api);
  const orders: Order[] = [
    {
      connectedLimitOrders: [],
      depth: 0.00016667,
      id: '970fcdd7-8483-4096-a1b3-69f0a7c23dc6',
      orderVolume: 0,
      price: 6148.874,
      side: 'Buy',
      timestamp: undefined,
      volume: 1.2
    },
    {
      connectedLimitOrders: [],
      depth: 0.00137778,
      id: 'ac983f4e-024a-40ab-bc29-319715ba8a7b',
      orderVolume: 0,
      price: 6143.658,
      side: 'Buy',
      timestamp: undefined,
      volume: 0.5
    }
  ].map((a: any) => Order.create(a));

  let volume;
  let nextVolume;
  let type;

  beforeEach(() => {
    orderStore.marketTotal = {
      canBeUpdated: true,
      operationType: '',
      operationVolume: 0,
      price: 0
    };
  });

  describe('market total', () => {
    it('should block market total price after orders were updated from wamp', () => {
      orderStore.setMarketTotal();
      expect(orderStore.marketTotal.price).toBe(0);

      orderStore.rootStore.orderBookStore.getBids = jest.fn(() => orders);
      orderStore.setMarketTotal();

      expect(orderStore.marketTotal.canBeUpdated).toBeFalsy();
      expect(orderStore.marketTotal.price).toBe(0);
    });
  });

  describe('market total', () => {
    it('should not block market total price for manual update', () => {
      volume = 1;
      type = Side.Sell;

      orderStore.setMarketTotal();
      orderStore.setMarketTotal(volume, Side.Sell);

      expect(orderStore.marketTotal.operationVolume).toBe(volume);
      expect(orderStore.marketTotal.operationType).toBe(type);
    });
  });

  describe('market total', () => {
    it('should block market total price for when debounce parameter injected', () => {
      volume = 1;
      type = Side.Sell;

      orderStore.setMarketTotal(volume, Side.Sell, true);

      nextVolume = 2;
      orderStore.setMarketTotal(volume, Side.Sell, true);

      expect(orderStore.marketTotal.canBeUpdated).toBeFalsy();
      expect(orderStore.marketTotal.operationVolume).toBe(volume);
    });
  });
});
