import {computed, observable} from 'mobx';
import {curry} from 'rambda';
import {OrderRequestBody, StopLimitRequestBody} from '../api/orderApi';
import {AnalyticsEvents} from '../constants/analyticsEvents';
import {ArrowDirection, OrderType, Side} from '../models';
import {
  getMaxAvailableVolume,
  mapToEffectivePrice
} from '../models/mappers/orderMapper';
import {AnalyticsService} from '../services/analyticsService';
import {
  DEFAULT_INPUT_VALUE,
  onArrowClick,
  onValueChange
} from '../utils/inputNumber';
import {formattedNumber} from '../utils/localFormatted/localFormatted';
import {bigToFixed, getPercentsOf, precisionFloor} from '../utils/math';
import {
  getPercentOfValueForLimit,
  isAmountExceedLimitBalance
} from '../utils/order';
import {BaseStore, RootStore} from './index';

const MARKET_TOTAL_DEBOUNCE = 1000;

class UiOrderStore extends BaseStore {
  @computed
  get isCurrentSideSell() {
    return this.side === Side.Sell;
  }

  @computed
  get marketAmount() {
    const price =
      (this.side === Side.Sell
        ? this.rootStore.orderBookStore.bestBidPrice
        : this.rootStore.orderBookStore.bestAskPrice) || 0;

    return price * +this.amountValue;
  }

  @computed
  get limitAmount() {
    return +this.priceValue * +this.amountValue;
  }

  @computed
  get stopLimitAmount() {
    return +this.priceValue * +this.amountValue;
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
  @observable market: OrderType = OrderType.Limit;
  @observable side: Side = Side.Sell;
  priceAccuracy: number = 2;
  amountAccuracy: number = 2;

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
  setAmountValueWithFixed = (amount: number | string) =>
    (this.amountValue = !amount
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

  getPercentChangeHandle = () => {
    switch (this.market) {
      case OrderType.Limit:
        return this.handleLimitPercentageChange;
      case OrderType.StopLimit:
        return this.handleStopLimitPercentageChange;
      case OrderType.Market:
        return this.handleMarketPercentageChange;
    }
  };

  handleLimitPercentageChange = (balance: number, percents: number) => {
    this.setAmountValueWithFixed(
      this.onPercentChangeForLimit(percents, balance, this.side)
    );
  };

  handleStopLimitPercentageChange = (balance: number, percents: number) => {
    this.setAmountValueWithFixed(
      this.onPercentChangeForLimit(percents, balance, this.side)
    );
  };

  handleMarketPercentageChange = (balance: number, percents: number) => {
    this.setAmountValueWithFixed(
      this.onPercentChangeForMarket(percents, balance)
    );
  };

  handleMarketQuantityArrowClick = (operation: ArrowDirection) => {
    this.handleAmountArrowClick(operation);
    this.setMarketTotal(this.amountValue, this.side, true);
  };

  onPercentChangeForMarket = (percents: number, value: number) => {
    if (this.isCurrentSideSell) {
      return getPercentsOf(percents, value, this.getAmountAccuracy());
    }
    const convertedBalance = getMaxAvailableVolume(
      value,
      this.rootStore.orderBookStore.rawAsks
    );
    return getPercentsOf(percents, convertedBalance, this.getAmountAccuracy());
  };

  getSpecificOrderValidationChecking = (mainAssetBalance: number) => (
    quoteAssetAccuracy: number,
    baseAssetId?: string,
    quoteAssetId?: string
  ) => {
    switch (this.market) {
      case OrderType.Market:
        return this.isMarketInvalid(
          mainAssetBalance,
          baseAssetId!,
          quoteAssetId!,
          quoteAssetAccuracy
        );
      case OrderType.StopLimit:
        return this.isStopLimitInvalid(mainAssetBalance, quoteAssetAccuracy);
      case OrderType.Limit:
        return this.isLimitInvalid(mainAssetBalance, quoteAssetAccuracy);
    }
  };

  isFlooredLimitAmountValid = (accuracy: number) => {
    return precisionFloor(this.limitAmount, accuracy) > 0;
  };

  isLimitInvalid = (mainAssetBalance: number, quoteAssetAccuracy: number) => {
    return (
      !this.isFlooredLimitAmountValid(quoteAssetAccuracy) ||
      !+this.priceValue ||
      !+this.amountValue ||
      isAmountExceedLimitBalance(
        this.isCurrentSideSell,
        this.amountValue,
        this.priceValue,
        mainAssetBalance,
        this.priceAccuracy,
        this.amountAccuracy
      )
    );
  };

  isFlooredMarketAmountValid = (accuracy: number) => {
    return precisionFloor(this.marketAmount, accuracy) > 0;
  };

  isMarketInvalid = (
    mainAssetBalance: number,
    baseAssetId: string,
    quoteAssetId: string,
    quoteAssetAccuracy: number
  ) => {
    return (
      !this.isFlooredMarketAmountValid(quoteAssetAccuracy) ||
      !+this.amountValue ||
      this.isAmountExceedMarketBalance(
        mainAssetBalance,
        baseAssetId,
        quoteAssetId
      )
    );
  };

  isFlooredStopLimitAmountValid = (accuracy: number) => {
    return precisionFloor(this.stopLimitAmount, accuracy) > 0;
  };

  isStopPriceValid = () => {
    const {bestAskPrice, bestBidPrice} = this.rootStore.orderBookStore;
    return this.isCurrentSideSell
      ? +this.stopPriceValue < bestBidPrice
      : +this.stopPriceValue > bestAskPrice;
  };

  isStopLimitInvalid = (
    mainAssetBalance: number,
    quoteAssetAccuracy: number
  ) => {
    return (
      !this.isFlooredStopLimitAmountValid(quoteAssetAccuracy) ||
      !this.isStopPriceValid() ||
      !+this.priceValue ||
      !+this.amountValue ||
      !+this.stopPriceValue ||
      isAmountExceedLimitBalance(
        this.isCurrentSideSell,
        this.amountValue,
        this.priceValue,
        mainAssetBalance,
        this.priceAccuracy,
        this.amountAccuracy
      )
    );
  };

  isAmountExceedMarketBalance = (
    mainAssetBalance: number,
    baseAssetId: string,
    quoteAssetId: string
  ) => {
    if (this.isCurrentSideSell) {
      return +this.amountValue > mainAssetBalance;
    } else {
      const convertedBalance = this.rootStore.marketStore.convert(
        mainAssetBalance,
        quoteAssetId,
        baseAssetId,
        this.rootStore.referenceStore.getInstrumentById
      );
      return (
        +this.amountValue >
        precisionFloor(+convertedBalance, this.amountAccuracy)
      );
    }
  };

  getConfirmButtonMessage = (baseAssetName: string) => {
    const amount = formattedNumber(+this.amountValue, this.amountAccuracy);
    return `${this.side} ${amount} ${baseAssetName}`;
  };

  getConfirmationMessage = (baseAssetName: string, quoteAssetName: string) => {
    const displayedPrice = formattedNumber(
      +parseFloat(this.priceValue),
      this.priceAccuracy
    );

    const displayedQuantity = formattedNumber(
      +parseFloat(this.amountValue),
      this.amountAccuracy
    );

    const messageSuffix =
      this.market === OrderType.Market
        ? 'at the market price'
        : `at the price of ${displayedPrice} ${quoteAssetName}`;
    return `${this.side.toLowerCase()} ${displayedQuantity} ${baseAssetName} ${messageSuffix}`;
  };

  getAnalyticTracker = () => {
    switch (this.market) {
      case OrderType.Market:
        return this.marketOrderTracker;
      case OrderType.StopLimit:
        return this.stopLimitTracker;
      case OrderType.Limit:
        return this.limitTracker;
    }
  };

  limitTracker = (body: OrderRequestBody) => {
    const {
      marketStore: {convert},
      uiStore: {selectedInstrument},
      referenceStore: {getInstrumentById}
    } = this.rootStore;

    const amountInBase = formattedNumber(
      convert(
        body.Volume * (body.Price as number),
        selectedInstrument!.quoteAsset.id,
        selectedInstrument!.baseAsset.id,
        getInstrumentById
      ),
      selectedInstrument!.baseAsset.accuracy
    );
    AnalyticsService.track(
      AnalyticsEvents.OrderPlaced(
        amountInBase,
        body.OrderAction,
        OrderType.Limit
      )
    );
  };

  stopLimitTracker = (body: StopLimitRequestBody) => {
    AnalyticsService.track(
      AnalyticsEvents.StopLimitOrderPlaced(
        `${body.LowerPrice}` || `${body.UpperPrice}`,
        `${body.LowerLimitPrice}` || `${body.UpperLimitPrice}`,
        `${body.Volume}`,
        body.OrderAction,
        OrderType.StopLimit
      )
    );
  };

  marketOrderTracker = (body: OrderRequestBody) => {
    AnalyticsService.track(
      AnalyticsEvents.OrderPlaced(
        `${body.Volume}`,
        body.OrderAction,
        OrderType.Market
      )
    );
  };

  getOrderRequestBody = (
    baseAssetId: string,
    assetPairId: string
  ): OrderRequestBody | StopLimitRequestBody => {
    switch (this.market) {
      case OrderType.Market:
        return this.getMarketRequestBody(baseAssetId, assetPairId);
      case OrderType.StopLimit:
        return this.getStopLimitRequestBody(assetPairId);
      case OrderType.Limit:
        return this.getLimitRequestBody(baseAssetId, assetPairId);
    }
  };

  getMarketRequestBody = (
    baseAssetId: string,
    assetPairId: string
  ): OrderRequestBody => {
    return {
      AssetId: baseAssetId,
      AssetPairId: assetPairId,
      OrderAction: this.side,
      Volume: parseFloat(this.amountValue)
    };
  };

  getLimitRequestBody = (
    baseAssetId: string,
    assetPairId: string
  ): OrderRequestBody => {
    return {
      AssetId: baseAssetId,
      AssetPairId: assetPairId,
      OrderAction: this.side,
      Volume: parseFloat(this.amountValue),
      Price: parseFloat(this.priceValue)
    };
  };

  getStopLimitRequestBody = (assetPairId: string): StopLimitRequestBody => {
    return {
      AssetPairId: assetPairId,
      OrderAction: this.side,
      Volume: parseFloat(this.amountValue),
      ...this.getPriceBodyForStopLimitOrder()
    };
  };

  getPriceBodyForStopLimitOrder = () => {
    const stopPrice = parseFloat(this.stopPriceValue);
    const limitPrice = parseFloat(this.priceValue);

    return this.isCurrentSideSell
      ? {
          LowerPrice: limitPrice,
          LowerLimitPrice: stopPrice,
          UpperPrice: null,
          UpperLimitPrice: null
        }
      : {
          LowerPrice: null,
          LowerLimitPrice: null,
          UpperPrice: limitPrice,
          UpperLimitPrice: stopPrice
        };
  };

  setMarketTotal = (
    operationVolume?: any,
    operationType: Side = this.side,
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
    this.setAmountValue(DEFAULT_INPUT_VALUE);
    this.setStopPriceValue(DEFAULT_INPUT_VALUE);
    const mid = await this.rootStore.orderBookStore.mid();
    this.setPriceValueWithFixed(mid);
    this.resetMarketTotal();
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
