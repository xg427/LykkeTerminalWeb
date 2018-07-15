import {pathOr} from 'rambda';
import withAuth from '../Auth/withAuth';
import {connect} from '../connect';
import {withKyc} from '../Kyc';
import Order from './Order';
import OrderLimit from './OrderLimit';
import OrderMarket from './OrderMarket';
import StopLimitOrder from './StopLimitOrder';

export interface OrderBasicFormProps {
  action: string;
  baseAssetName: string;
  quoteAssetName: string;
  balance: number;
  isDisable: boolean;
  isSell: boolean;
  onHandlePercentageChange: any;
  onReset?: any;
  onSubmit: any;
  percents: any[];
  quantity: string;
  amountAccuracy: number;
  priceAccuracy: number;
  baseAssetAccuracy?: any;
  balanceAccuracy: number;
  onQuantityChange: (value: string) => void;
  updatePercentageState: (field: string) => void;
}

const ConnectedOrder = connect(
  ({
    balanceListStore: {baseAssetBalance, quoteAssetBalance},
    orderBookStore: {bestAskPrice, bestBidPrice},
    orderStore: {placeOrder},
    uiStore: {
      selectedInstrument: instrument,
      readOnlyMode,
      isDisclaimerShown,
      disclaimedAssets
    },
    referenceStore: {getBaseAsset, getInstrumentById},
    uiOrderStore: {
      handlePercentageChange,
      isLimitInvalid,
      isMarketInvalid,
      getPriceAccuracy,
      getAmountAccuracy,
      priceValue,
      amountValue,
      currentMarket,
      isCurrentSideSell,
      setMarket,
      setSide,
      resetOrder,
      marketTotalPrice,
      isEnoughLiquidity,
      setMarketTotal,
      resetMarketTotal,
      handleMarketQuantityArrowClick
    },
    authStore: {isAuth, isKycPassed},
    marketStore: {convert}
  }) => ({
    accuracy: {
      priceAccuracy: getPriceAccuracy(),
      amountAccuracy: getAmountAccuracy(),
      baseAssetAccuracy: pathOr(2, ['baseAsset', 'accuracy'], instrument),
      quoteAssetAccuracy: pathOr(2, ['quoteAsset', 'accuracy'], instrument)
    },
    ask: bestAskPrice,
    baseAssetId: pathOr('', ['baseAsset', 'id'], instrument),
    get baseAssetName() {
      return pathOr('', ['baseAsset', 'name'], instrument);
    },
    get quoteAssetName() {
      return pathOr('', ['quoteAsset', 'name'], instrument);
    },
    bid: bestBidPrice,
    currency: pathOr('', ['id'], instrument),
    isLimitInvalid,
    isMarketInvalid,
    handlePercentageChange,
    handleMarketQuantityArrowClick,
    placeOrder,
    quoteAssetId: pathOr('', ['quoteAsset', 'id'], instrument),
    baseAssetBalance,
    quoteAssetBalance,
    isAuth,
    isKycPassed,
    readOnlyMode,
    instrument,
    priceValue,
    quantityValue: amountValue,
    resetOrder,
    currentMarket,
    isCurrentSideSell,
    setMarket,
    setSide,
    isDisclaimerShown,
    disclaimedAssets,
    setMarketTotal,
    marketTotalPrice,
    isEnoughLiquidity,
    resetMarketTotal,
    convert,
    baseAsset: getBaseAsset,
    getInstrumentById
  }),
  withAuth(withKyc(Order))
);

const ConnectedLimitOrder = connect(
  ({
    balanceListStore: {baseAssetBalance, quoteAssetBalance},
    uiOrderStore: {
      handlePriceArrowClick,
      handleAmountArrowClick,
      handlePriceChange,
      handleAmountChange,
      isCurrentSideSell
    },
    uiStore: {selectedInstrument: instrument}
  }) => ({
    onPriceArrowClick: handlePriceArrowClick,
    onQuantityArrowClick: handleAmountArrowClick,
    onPriceChange: handlePriceChange,
    onQuantityChange: handleAmountChange,
    balance: isCurrentSideSell ? baseAssetBalance : quoteAssetBalance,
    balanceAccuracy: isCurrentSideSell
      ? pathOr(2, ['baseAsset', 'accuracy'], instrument)
      : pathOr(2, ['quoteAsset', 'accuracy'], instrument)
  }),
  OrderLimit
);

const ConnectedMarketOrder = connect(
  ({
    balanceListStore: {baseAssetBalance, quoteAssetBalance},
    uiOrderStore: {
      handleAmountArrowClick,
      handleAmountChange,
      isCurrentSideSell
    },
    uiStore: {selectedInstrument: instrument}
  }) => ({
    onQuantityArrowClick: handleAmountArrowClick,
    onQuantityChange: handleAmountChange,
    balance: isCurrentSideSell ? baseAssetBalance : quoteAssetBalance,
    balanceAccuracy: isCurrentSideSell
      ? pathOr(2, ['baseAsset', 'accuracy'], instrument)
      : pathOr(2, ['quoteAsset', 'accuracy'], instrument)
  }),
  OrderMarket
);

const ConnectedStopLimitOrder = connect(
  ({
    balanceListStore: {baseAssetBalance, quoteAssetBalance},
    uiStore: {selectedInstrument: instrument},
    uiOrderStore: {
      handlePriceArrowClick,
      handleAmountArrowClick,
      handlePriceChange,
      handleAmountChange,
      handleStopPriceChange,
      handleStopPriceArrowClick,
      stopPriceValue,
      amountValue,
      priceValue,
      isCurrentSideSell
    }
  }) => ({
    onPriceArrowClick: handlePriceArrowClick,
    onAmountArrowClick: handleAmountArrowClick,
    onPriceChange: handlePriceChange,
    onAmountChange: handleAmountChange,
    onStopPriceChange: handleStopPriceChange,
    onStopPriceArrowClick: handleStopPriceArrowClick,
    stopPriceValue,
    amountValue,
    priceValue,
    amountAssetName: pathOr(
      '',
      [`${isCurrentSideSell ? 'baseAsset' : 'quoteAsset'}`, 'id'],
      instrument
    ),
    priceAssetName: pathOr('', ['quoteAsset', 'id'], instrument),
    stopPriceAssetName: pathOr('', ['quoteAsset', 'id'], instrument),
    isCurrentSideSell,
    balance: isCurrentSideSell ? baseAssetBalance : quoteAssetBalance,
    balanceAccuracy: isCurrentSideSell
      ? pathOr(2, ['baseAsset', 'accuracy'], instrument)
      : pathOr(2, ['quoteAsset', 'accuracy'], instrument)
  }),
  StopLimitOrder
);

export {ConnectedStopLimitOrder as StopLimitOrder};
export {ConnectedMarketOrder as OrderMarket};
export {ConnectedLimitOrder as OrderLimit};
export {ConnectedOrder as Order};
