import {
  AssetModel,
  InstrumentModel,
  OrderType,
  TradeFilter,
  TradeModel,
  WalletModel
} from '../../models/index';
import {RootStore, TradeStore} from '../index';

jest.mock('../../models/tradeModel.mapper', () => ({
  fromWampToTrade: jest.fn(),
  fromWampToPublicTrade: jest.fn()
}));

describe('trade store', () => {
  let tradeStore: TradeStore;

  const rootStore = new RootStore();
  const api: any = {
    fetchPublicTrades: jest.fn(),
    fetchTrades: jest.fn()
  };

  const getTestInstrument = (params?: Partial<InstrumentModel>) => {
    return new InstrumentModel({
      id: 'BTCUSD',
      baseAsset: new AssetModel({id: 'BTC'}),
      quoteAsset: new AssetModel({id: 'USD'}),
      bid: 9500,
      ask: 9600,
      ...params
    });
  };
  const getTestTrade = (params?: Partial<TradeModel>) => {
    return new TradeModel({
      instrument: getTestInstrument(),
      ...params
    });
  };

  beforeEach(() => {
    api.fetchTrades = jest.fn(() =>
      Promise.resolve([
        {
          Id: '201802081814_8c8b3211-855d-4cdb-b242-68fce3b0c14e',
          DateTime: '2018-02-08T18:14:25.637Z',
          Type: 'Trade',
          State: 'Finished',
          Amount: 0.0001,
          Asset: 'BTC',
          AssetPair: null,
          Price: null
        },
        {
          Id: '201802081814_5037f2da-71d6-4bd5-a633-45432de1ee2e',
          DateTime: '2018-02-08T18:14:25.637Z',
          Type: 'Trade',
          State: 'Finished',
          Amount: -0.85,
          Asset: 'USD',
          AssetPair: null,
          Price: null
        }
      ])
    );

    tradeStore = new TradeStore(rootStore, api);
  });

  describe('state', () => {
    beforeEach(() => {
      tradeStore.unsubscribeFromPublicTrades = jest.fn();
    });

    it('trades should be defined after instantiation', () => {
      expect(tradeStore.getAllTrades).toBeDefined();
      expect(tradeStore.getAllTrades).not.toBeNull();
    });

    it('public trades should be defined after instantiation', () => {
      expect(tradeStore.getPublicTrades).toBeDefined();
      expect(tradeStore.getPublicTrades).not.toBeNull();
    });

    it('trades should be an empty array by default', () => {
      expect(tradeStore.getAllTrades instanceof Array).toBeTruthy();
      expect(tradeStore.getAllTrades.length).toBe(0);
    });

    it('public trades should be an empty array by default', () => {
      expect(tradeStore.getPublicTrades instanceof Array).toBeTruthy();
      expect(tradeStore.getPublicTrades.length).toBe(0);
    });
  });

  describe('add trade', () => {
    beforeEach(() => {
      tradeStore.filter = TradeFilter.CurrentAsset;
      rootStore.uiStore.selectedInstrument = getTestInstrument();
    });

    it('should add trade if trade filter set to All value', () => {
      tradeStore.filter = TradeFilter.All;
      tradeStore.addTrade(getTestTrade());
      expect(tradeStore.getAllTrades).toHaveLength(1);
    });

    it('should not add trade if instrument from filter not equal to trade instrument', () => {
      tradeStore.addTrade(
        getTestTrade({
          instrument: getTestInstrument({id: 'LKKUSD'})
        })
      );
      expect(tradeStore.getAllTrades).toHaveLength(0);
    });
  });

  describe('add trades', () => {
    beforeEach(() => {
      tradeStore.filter = TradeFilter.CurrentAsset;
      rootStore.uiStore.selectedInstrument = getTestInstrument();
    });

    it('should add trades if trade filter set to All value', () => {
      tradeStore.filter = TradeFilter.All;
      tradeStore.addTrades([getTestTrade(), getTestTrade()]);
      expect(tradeStore.getAllTrades).toHaveLength(2);
    });

    it('should not add trades if instrument from filter not equal to trade instrument', () => {
      const correctTrade = getTestTrade();
      const incorrectTrade = getTestTrade({
        instrument: getTestInstrument({id: 'LKKUSD'})
      });
      tradeStore.addTrades([correctTrade, incorrectTrade]);
      expect(tradeStore.getAllTrades).toHaveLength(1);
      expect(tradeStore.getAllTrades).toEqual([correctTrade]);
    });

    it('should not add trades if wallet is not trading', () => {
      rootStore.balanceListStore.tradingWallet = new WalletModel({
        Id: 'Trading',
        Name: 'Trading',
        Balances: [],
        Type: 'Trading'
      });
      const correctTrade = getTestTrade({
        walletId: rootStore.balanceListStore.tradingWallet.id
      });
      const incorrectTrade = getTestTrade({
        walletId: 'Test'
      });
      tradeStore.addTrades([correctTrade, incorrectTrade]);
      expect(tradeStore.getAllTrades).toHaveLength(1);
      expect(tradeStore.getAllTrades).toEqual([correctTrade]);
    });
  });

  describe('method onTrades', () => {
    it('should add trades came from arguments', () => {
      tradeStore.addTrade = jest.fn();
      tradeStore.onTrades([{}, {}, {}]);
      expect(tradeStore.addTrade).toHaveBeenCalled();
    });
  });

  describe('method onPublicTrades', () => {
    it('should add public trades came from arguments', () => {
      tradeStore.addPublicTrades = jest.fn();
      tradeStore.onPublicTrades([{}, {}, {}]);
      expect(tradeStore.addPublicTrades).toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('should clear trades', async () => {
      await tradeStore.addTrades([getTestTrade()]);
      expect(tradeStore.getAllTrades.length).toBeGreaterThan(0);

      tradeStore.reset();

      expect(tradeStore.getAllTrades.length).toBe(0);
    });
  });

  describe('fetch trades', () => {
    it('should populate tradeList collection', async () => {
      await tradeStore.addTrades([getTestTrade()]);
      expect(tradeStore.getAllTrades.length).toBeGreaterThan(0);
    });
  });

  describe('trade item', () => {
    it('should contain the following fields', async () => {
      await tradeStore.addTrades([
        getTestTrade({
          side: 'Buy',
          symbol: 'LKKUSD',
          volume: 1,
          timestamp: new Date().toLocaleString()
        })
      ]);
      const trade = tradeStore.getAllTrades[0];
      expect(trade.side).toBeDefined();
      expect(trade.symbol).toBeDefined();
      expect(trade.volume).toBeDefined();
      expect(trade.timestamp).toBeDefined();
    });
  });

  describe('add public trade', () => {
    let testObject: TradeModel;

    beforeEach(() => {
      testObject = {
        asset: '',
        symbol: 'LKKUSD',
        volume: 1,
        timestamp: Date.now().toString(),
        side: 'Buy',
        tradeId: 't1',
        id: '1',
        price: 1,
        oppositeVolume: 1,
        orderType: OrderType.Market,
        fee: 0
      };
    });

    it('should add to public trades collection', () => {
      tradeStore.addPublicTrades([testObject]);
      expect(tradeStore.getPublicTrades).toHaveLength(1);
      expect(tradeStore.getAllTrades).toHaveLength(0);
    });

    it('should limit number of items by 100', () => {
      tradeStore.addPublicTrades(new Array(101).fill(testObject));
      expect(tradeStore.getPublicTrades).toHaveLength(100);
    });
  });
});
