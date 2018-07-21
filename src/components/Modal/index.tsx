import {connect} from '../connect';
import EditOrder, {EditOrderProps} from './EditOrder';
import QRModal from './QRModal';
import withModal from './withModal';

import OrderLimit from '../Order/OrderLimit';
import StopLimitOrder from '../Order/StopLimitOrder';

const ConnectedEditOrderModal = connect(
  ({
    balanceListStore: {tradingWallet: {balances: availableBalances}},
    referenceStore: {getInstrumentById},
    orderStore: {editOrder},
    editOrderStore: {
      setAmountValueWithFixed,
      setPriceValueWithFixed,
      setStopPriceValueWithFixed,
      setAmountAccuracy,
      setPriceAccuracy,
      setSide,
      getOrderRequestBody,
      setMarket
    }
  }) => ({
    editOrder,
    availableBalances,
    getInstrumentById,
    setAmountValueWithFixed,
    setPriceValueWithFixed,
    setStopPriceValueWithFixed,
    setAmountAccuracy,
    setPriceAccuracy,
    setSide,
    getOrderRequestBody,
    setMarket
  }),
  withModal<EditOrderProps>(EditOrder)
);

const ConnectedEditLimitOrder = connect(
  ({
    editOrderStore: {
      amountValue,
      priceValue,
      limitAmount,
      handlePriceArrowClick,
      handlePriceChange,
      handleAmountChange,
      handleAmountArrowClick,
      handleLimitPercentageChange,
      isLimitInvalid,
      getConfirmButtonMessage
    }
  }) => ({
    amount: amountValue,
    price: priceValue,
    limitAmount,
    onPriceArrowClick: handlePriceArrowClick,
    onPriceChange: handlePriceChange,
    onAmountChange: handleAmountChange,
    onAmountArrowClick: handleAmountArrowClick,
    handlePercentageChange: handleLimitPercentageChange,
    isOrderInvalid: isLimitInvalid,
    getConfirmButtonMessage
  }),
  OrderLimit
);

const ConnectedEditStopLimitOrder = connect(
  ({
    editOrderStore: {
      amountValue,
      priceValue,
      stopPriceValue,
      stopLimitAmount,
      handlePriceArrowClick,
      handlePriceChange,
      handleStopPriceArrowClick,
      handleStopPriceChange,
      handleAmountChange,
      handleAmountArrowClick,
      handleStopLimitPercentageChange,
      isStopLimitInvalid,
      getConfirmButtonMessage
    }
  }) => ({
    amount: amountValue,
    price: priceValue,
    stopPrice: stopPriceValue,
    stopLimitAmount,
    onPriceArrowClick: handlePriceArrowClick,
    onPriceChange: handlePriceChange,
    onAmountChange: handleAmountChange,
    onAmountArrowClick: handleAmountArrowClick,
    onStopPriceChange: handleStopPriceChange,
    onStopPriceArrowClick: handleStopPriceArrowClick,
    handlePercentageChange: handleStopLimitPercentageChange,
    isOrderInvalid: isStopLimitInvalid,
    getConfirmButtonMessage
  }),
  StopLimitOrder
);

const ConnectedQRModal = connect(
  ({sessionStore: {getQrId}}) => ({
    qrId: getQrId()
  }),
  QRModal
);

export {ConnectedEditOrderModal as EditOrder};
export {ConnectedQRModal as QRModal};
export {ConnectedEditLimitOrder as EditLimitOrder};
export {ConnectedEditStopLimitOrder as EditStopLimitOrder};
