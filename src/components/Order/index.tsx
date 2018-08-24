import {pathOr} from 'rambda';
import withAuth from '../Auth/withAuth';
import {connect} from '../connect';
import {withKyc} from '../Kyc';
import Order from './Order';
import OrderLimit from './OrderLimit';
import OrderMarket from './OrderMarket';
import StopLimitOrder from './StopLimitOrder';

import * as React from 'react';
import {default as CommonOrder} from './CommonOrder';

import {ArrowDirection} from '../../models';

import {IPercentage} from '../../constants/ordersPercentage';

const ConnectedOrder = connect(
  ({
    orderStore: {placeOrder},
    uiStore: {readOnlyMode, isDisclaimerShown, disclaimedAssets},
    referenceStore,
    uiOrderStore: {
      getPriceAccuracy,
      getAmountAccuracy,
      market,
      isCurrentSideSell,
      setMarket,
      setSide,
      resetOrder,
      getConfirmationMessage,
      getOrderRequestBody
    },
    authStore: {isAuth, isKycPassed},
    marketStore: {convert}
  }) => ({
    placeOrder,
    isAuth,
    isKycPassed,
    readOnlyMode,
    resetOrder,
    currentMarket: market,
    isCurrentSideSell,
    setMarket,
    setSide,
    isDisclaimerShown,
    disclaimedAssets,
    getOrderRequestBody,
    getConfirmationMessage
  }),
  withAuth(withKyc(Order))
);

const withOrderConnectedProps = (Component: any) => (props: any) => {
  return (
    <ConnectedOrderCommonProps>
      <Component {...props} />
    </ConnectedOrderCommonProps>
  );
};

export interface CommonOrderProps {
  onAmountArrowClick: (operation: ArrowDirection) => void;
  onAmountChange: (value: string) => void;
  balance: number;
  balanceAccuracy: number;
  isCurrentSideSell: boolean;
  baseAssetId: string;
  quoteAssetId: string;
  amount: string;
  availableAssetName: string;
  baseAssetName: string;
  quoteAssetName: string;
  quoteAssetAccuracy: number;
  updatePercentState: any;
  percents: IPercentage[];
  resetPercents: () => void;
  handleButtonClick: () => void;
  getConfirmButtonMessage: () => string;
  isButtonDisable: boolean;
  isOrderInvalid: () => boolean;
}

const ConnectedOrderCommonProps = connect(
  ({
    balanceListStore: {baseAssetBalance, quoteAssetBalance},
    uiOrderStore: {
      handleAmountArrowClick,
      handleAmountChange,
      isCurrentSideSell,
      amountValue,
      resetOrder,
      getConfirmButtonMessage,
      getSpecificOrderValidationChecking
    },
    uiStore: {selectedInstrument: instrument}
  }) => ({
    onAmountArrowClick: handleAmountArrowClick,
    onAmountChange: handleAmountChange,
    balance: isCurrentSideSell ? baseAssetBalance : quoteAssetBalance,
    balanceAccuracy: isCurrentSideSell
      ? pathOr(2, ['baseAsset', 'accuracy'], instrument)
      : pathOr(2, ['quoteAsset', 'accuracy'], instrument),
    baseAssetId: pathOr('', ['baseAsset', 'id'], instrument),
    quoteAssetId: pathOr('', ['quoteAsset', 'id'], instrument),
    amount: amountValue,
    availableAssetName: isCurrentSideSell
      ? pathOr('', ['baseAsset', 'name'], instrument)
      : pathOr('', ['quoteAsset', 'name'], instrument),
    baseAssetName: pathOr('', ['baseAsset', 'name'], instrument),
    quoteAssetName: pathOr('', ['quoteAsset', 'name'], instrument),
    amountAccuracy: pathOr(2, ['baseAsset', 'accuracy'], instrument),
    quoteAssetAccuracy: pathOr(2, ['quoteAsset', 'accuracy'], instrument),
    getConfirmButtonMessage,
    isOrderInvalid: getSpecificOrderValidationChecking(
      isCurrentSideSell ? baseAssetBalance : quoteAssetBalance
    )
  }),
  CommonOrder
);

const ConnectedLimitOrder = connect(
  ({
    uiOrderStore: {
      handlePriceArrowClick,
      handlePriceChange,
      priceValue,
      handleLimitPercentageChange,
      limitAmount
    }
  }) => ({
    onPriceArrowClick: handlePriceArrowClick,
    onPriceChange: handlePriceChange,
    price: priceValue,
    handlePercentageChange: handleLimitPercentageChange,
    limitAmount
  }),
  withOrderConnectedProps(OrderLimit)
);

const ConnectedMarketOrder = connect(
  ({uiOrderStore: {handleMarketPercentageChange, marketAmount}}) => ({
    handlePercentageChange: handleMarketPercentageChange,
    marketAmount
  }),
  withOrderConnectedProps(OrderMarket)
);

const ConnectedStopLimitOrder = connect(
  ({
    uiOrderStore: {
      handlePriceArrowClick,
      handlePriceChange,
      handleStopPriceChange,
      handleStopPriceArrowClick,
      stopPriceValue,
      priceValue,
      handleStopLimitPercentageChange,
      stopLimitAmount
    }
  }) => ({
    onPriceArrowClick: handlePriceArrowClick,
    onPriceChange: handlePriceChange,
    onStopPriceChange: handleStopPriceChange,
    onStopPriceArrowClick: handleStopPriceArrowClick,
    stopPrice: stopPriceValue,
    price: priceValue,
    handlePercentageChange: handleStopLimitPercentageChange,
    stopLimitAmount
  }),
  withOrderConnectedProps(StopLimitOrder)
);

export {ConnectedStopLimitOrder as StopLimitOrder};
export {ConnectedMarketOrder as OrderMarket};
export {ConnectedLimitOrder as OrderLimit};
export {ConnectedOrder as Order};
