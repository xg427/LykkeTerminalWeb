import {action, computed, observable} from 'mobx';
import {reverse} from 'rambda';
import {Order, TradeModel} from '../models';
import {precisionFloor} from '../utils/math';
import {BaseStore, RootStore} from './index';
import {aggregateOrders, connectLimitOrders} from './orderBookHelpers';

class DepthChartStore extends BaseStore {
  multiplers: number[] = [0, 1, 0.75, 0.5, 0.25, 0.1, 0.05, 0.025];
  maxMultiplier = this.multiplers.length - 1;
  @observable spanMultiplierIdx = 3;

  @computed
  get span() {
    return this.multiplers[this.spanMultiplierIdx] * 100;
  }

  @computed
  get seedSpan() {
    if (this.rootStore.uiStore.selectedInstrument) {
      return Math.pow(10, -this.rootStore.uiStore.selectedInstrument.accuracy);
    }
    return 0;
  }

  @computed
  get instrumentSpan() {
    if (this.rootStore.uiStore.selectedInstrument) {
      return precisionFloor(
        this.seedSpan * 1,
        this.rootStore.uiStore.selectedInstrument.accuracy
      );
    }
    return 0;
  }

  constructor(store: RootStore) {
    super(store);
  }

  reduceBidsArray = (bids: Order[]) => {
    const mid = 1;
    const lowerBound = mid - mid * this.multiplers[this.spanMultiplierIdx];
    const filteredBids = bids.filter(bid => {
      return bid.price > lowerBound;
    });
    return filteredBids.length ? filteredBids : bids.slice(0, 1);
  };

  reduceAsksArray = (asks: Order[]) => {
    const mid = 1;
    const upperBound = mid + mid * this.multiplers[this.spanMultiplierIdx];
    const filteredAsks = asks.filter(ask => {
      return ask.price < upperBound;
    });
    return filteredAsks.length
      ? filteredAsks
      : asks.slice(asks.length - 1, asks.length);
  };

  @computed
  get bids() {
    const {
      orderListStore: {limitOrdersForThePair: limitOrders}
    } = this.rootStore;
    const aggregatedOrders = aggregateOrders(
      this.rootStore.orderBookStore.rawBids,
      this.instrumentSpan,
      false
    );
    return this.reduceBidsArray(
      connectLimitOrders(aggregatedOrders, limitOrders, this.span, false)
    );
  }

  @computed
  get asks() {
    const {
      orderListStore: {limitOrdersForThePair: limitOrders}
    } = this.rootStore;
    const aggregatedOrders = aggregateOrders(
      this.rootStore.orderBookStore.rawAsks,
      this.instrumentSpan,
      true
    );
    return this.reduceAsksArray(
      reverse(
        connectLimitOrders(aggregatedOrders, limitOrders, this.span, true)
      )
    );
  }

  mid = async () => await this.rootStore.orderBookStore.mid();

  spread = async () => {
    const bestAsk = await this.rootStore.orderBookStore.bestAsk();
    const bestBid = await this.rootStore.orderBookStore.bestBid();
    return (bestAsk - bestBid) / bestAsk * 100;
  };

  lastTradePrice = () => {
    const trades: TradeModel[] = this.rootStore.tradeStore.getAllTrades;
    return trades[0] ? trades[0]!.price : 0;
  };

  @action
  nextSpan = () => {
    if (this.spanMultiplierIdx < this.maxMultiplier) {
      this.spanMultiplierIdx++;
    }
  };

  @action
  prevSpan = () => {
    if (this.spanMultiplierIdx > 1) {
      this.spanMultiplierIdx--;
    }
  };

  reset = () => {
    this.spanMultiplierIdx = 0;
  };
}

export default DepthChartStore;
