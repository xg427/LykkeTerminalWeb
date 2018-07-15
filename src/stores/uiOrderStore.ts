import {computed, observable} from 'mobx';
import {curry} from 'rambda';
import {ArrowDirection, OrderType, Side} from '../models';
import {
  getMaxAvailableVolume,
  mapToEffectivePrice
} from '../models/mappers/orderMapper';
import {
  DEFAULT_INPUT_VALUE,
  onArrowClick,
  onValueChange
} from '../utils/inputNumber';
import {bigToFixed, getPercentsOf, precisionFloor} from '../utils/math';
import {
  getPercentOfValueForLimit,
  isAmountExceedLimitBalance
} from '../utils/order';
import {BaseStore, RootStore} from './index';

const MARKET_TOTAL_DEBOUNCE = 1000;

export interface PercentageChangeConfig {
  balance: number;
  baseAssetId: string;
  quoteAssetId: string;
  percents: number;
}

class UiOrderStore extends BaseStore {
  @computed
  get currentMarket() {
    return this.market;
  }

  @computed
  get isCurrentSideSell() {
    return this.side === Side.Sell;
  }

  @computed
  get marketTotalPrice() {
    return this.marketTotal.price;
  }

  @computed
  get isEnoughLiquidity() {
    return this.marketTotal.isEnoughLiquidity;
  }

  handlePriceChange: (price: string) => void;
  handleAmountChange: (price: string) => void;
  handleStopPriceChange: (price: string) => void;
  handlePriceArrowClick: (operation: ArrowDirection) => void;
  handleAmountArrowClick: (operation: ArrowDirection) => void;
  handleStopPriceArrowClick: (operation: ArrowDirection) => void;
  onPercentChangeForLimit: (
    percents: number,
    value: number,
    side: Side
  ) => number;

  @observable
  marketTotal: any = {
    canBeUpdated: true,
    operationType: '',
    operationVolume: 0,
    isEnoughLiquidity: true,
    price: 0
  };

  @observable stopPriceValue: string = DEFAULT_INPUT_VALUE;
  @observable priceValue: string = DEFAULT_INPUT_VALUE;
  @observable amountValue: string = DEFAULT_INPUT_VALUE;
  @observable private market: OrderType = OrderType.Limit;
  @observable private side: Side = Side.Sell;
  private priceAccuracy: number = 2;
  private amountAccuracy: number = 2;

  constructor(store: RootStore) {
    super(store);

    this.handlePriceChange = curry(onValueChange)(
      this.setPriceValue,
      this.getPriceAccuracy
    );
    this.handleAmountChange = curry(onValueChange)(
      this.setAmountValue,
      this.getAmountAccuracy
    );
    this.handleStopPriceChange = curry(onValueChange)(
      this.setStopPriceValue,
      this.getPriceAccuracy
    );
    this.handlePriceArrowClick = curry(onArrowClick)(
      this.getPriceValue,
      this.getPriceAccuracy,
      this.setPriceValueWithFixed
    );
    this.handleAmountArrowClick = curry(onArrowClick)(
      this.getAmountValue,
      this.getAmountAccuracy,
      this.setAmountValueWithFixed
    );
    this.handleStopPriceArrowClick = curry(onArrowClick)(
      this.getStopPriceValue,
      this.getPriceAccuracy,
      this.setStopPriceValueWithFixed
    );

    this.onPercentChangeForLimit = curry(getPercentOfValueForLimit)(
      this.getPriceValue,
      this.getAmountAccuracy
    );
  }

  setPriceValueWithFixed = (price: number) =>
    (this.priceValue = !price
      ? DEFAULT_INPUT_VALUE
      : bigToFixed(price, this.priceAccuracy).toString());
  setQuantityValueWithFixed = (amount: number | string) =>
    (this.quantityValue = !quantity
      ? DEFAULT_INPUT_VALUE
      : bigToFixed(amount, this.amountAccuracy).toString());
  setStopPriceValueWithFixed = (stopPrice: number) =>
    (this.stopPriceValue = !stopPrice
      ? DEFAULT_INPUT_VALUE
      : bigToFixed(stopPrice, this.priceAccuracy).toString());

  setPriceValue = (price: string) => (this.priceValue = price);
  setAmountValue = (amount: string) => (this.amountValue = amount);
  setStopPriceValue = (stopPrice: string) => (this.stopPriceValue = stopPrice);

  getPriceValue = () => this.priceValue;
  getAmountValue = () => this.amountValue;
  getStopPriceValue = () => this.stopPriceValue;

  getPriceAccuracy = () => this.priceAccuracy;
  getAmountAccuracy = () => this.amountAccuracy;
  setPriceAccuracy = (priceAcc: number) => (this.priceAccuracy = priceAcc);
  setAmountAccuracy = (amountAcc: number) => (this.amountAccuracy = amountAcc);

  setMarket = (type: OrderType) => (this.market = type);
  setSide = (side: Side) => (this.side = side);

  handlePriceClickFromOrderBook = (price: number, side: Side) => {
    this.setPriceValueWithFixed(price);
    if (this.market !== OrderType.Limit) {
      this.setAmountValueWithFixed(0);
      this.setMarket(OrderType.Limit);
    }
    this.setSide(side);
  };

  handleVolumeClickFromOrderBook = (volume: number, side: Side) => {
    this.setAmountValueWithFixed(volume);
    this.setMarket(OrderType.Market);
    this.setSide(side);
    this.setMarketTotal(volume, side);
  };

  handlePercentageChange = (config: PercentageChangeConfig) => {
    const {balance, baseAssetId, quoteAssetId, percents} = config;

    if (this.market === OrderType.Limit) {
      this.setAmountValueWithFixed(
        this.onPercentChangeForLimit(percents, balance, this.side)
      );
    } else {
      this.setAmountValueWithFixed(
        this.onPercentChangeForMarket(
          percents,
          balance,
          quoteAssetId,
          baseAssetId
        )
      );
      this.setMarketTotal(this.quantityValue, this.side);
    }
  };

  handleMarketQuantityArrowClick = (operation: ArrowDirection) => {
    this.handleQuantityArrowClick(operation);
    this.setMarketTotal(this.quantityValue, this.side, true);
  };

  onPercentChangeForMarket = (
    percents: number,
    value: number,
    quoteAssetId: string,
    baseAssetId: string
  ) => {
    if (this.isCurrentSideSell) {
      return getPercentsOf(percents, value, this.getAmountAccuracy());
    }
    const convertedBalance = getMaxAvailableVolume(
      value,
      this.rootStore.orderBookStore.rawAsks
    );
    return getPercentsOf(percents, convertedBalance, this.getAmountAccuracy());
  };

  isLimitInvalid = (baseAssetBalance: number, quoteAssetBalance: number) => {
    return (
      !+this.priceValue ||
      !+this.amountValue ||
      isAmountExceedLimitBalance(
        this.isCurrentSideSell,
        this.amountValue,
        this.priceValue,
        baseAssetBalance,
        quoteAssetBalance,
        this.priceAccuracy,
        this.amountAccuracy
      )
    );
  };

  isMarketInvalid = (
    baseAssetId: string,
    quoteAssetId: string,
    baseAssetBalance: number,
    quoteAssetBalance: number
  ) => {
    return (
      !+this.amountValue ||
      this.isAmountExceedMarketBalance(
        baseAssetBalance,
        quoteAssetBalance,
        baseAssetId,
        quoteAssetId
      )
    );
  };

  isAmountExceedMarketBalance = (
    baseAssetBalance: number,
    quoteAssetBalance: number,
    baseAssetId: string,
    quoteAssetId: string
  ) => {
    const convertedBalance = this.rootStore.marketStore.convert(
      quoteAssetBalance,
      quoteAssetId,
      baseAssetId,
      this.rootStore.referenceStore.getInstrumentById
    );
    return this.isCurrentSideSell
      ? +this.amountValue > baseAssetBalance
      : +this.amountValue >
          precisionFloor(+convertedBalance, this.amountAccuracy);
  };

  setMarketTotal = (
    operationVolume?: any,
    operationType?: Side,
    debounce?: boolean
  ) => {
    if (operationVolume === '') {
      return this.resetMarketTotal();
    }

    const areNewValues = operationVolume && operationType;
    const isDebounceManually =
      areNewValues && debounce && !this.marketTotal.canBeUpdated;

    if (isDebounceManually) {
      return;
    } else if (debounce) {
      this.setDebounce();
    }

    if (operationVolume) {
      this.marketTotal.operationVolume =
        typeof operationVolume === 'number'
          ? operationVolume
          : parseFloat(operationVolume);
    }
    if (operationType) {
      this.marketTotal.operationType = operationType;
    }

    this.marketTotal.price = mapToEffectivePrice(
      this.marketTotal.operationVolume,
      this.getOrdersByOperationType()
    );

    this.marketTotal.isEnoughLiquidity = this.marketTotal.price !== null;
  };

  resetMarketTotal = () => {
    this.marketTotal = {
      canBeUpdated: true,
      operationType: '',
      operationVolume: 0,
      price: 0,
      isEnoughLiquidity: true
    };
  };

  resetOrder = async () => {
    const mid = await this.rootStore.orderBookStore.mid();
    this.setPriceValueWithFixed(mid);
    this.setAmountValue(DEFAULT_INPUT_VALUE);
  };

  // tslint:disable-next-line:no-empty
  reset = () => {};

  private setDebounce = () => {
    this.marketTotal.canBeUpdated = false;
    setTimeout(
      () => (this.marketTotal.canBeUpdated = true),
      MARKET_TOTAL_DEBOUNCE
    );
  };

  private getOrdersByOperationType = () => {
    switch (this.marketTotal.operationType) {
      case Side.Sell:
        return this.rootStore.orderBookStore.rawBids;
      case Side.Buy:
        return this.rootStore.orderBookStore.rawAsks;
      default:
        return [];
    }
  };
}

export default UiOrderStore;
