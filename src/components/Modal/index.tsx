import {connect} from '../connect';
import EditOrder, {EditOrderProps} from './EditOrder';
import QRModal, {QRModalProps} from './QRModal';
import withModal from './withModal';

import OrderLimit from '../Order/OrderLimit';
import StopLimitOrder from '../Order/StopLimitOrder';
import Modals, {ModalsProps} from './Modals';

import KycModal, {KycModalProps} from './KycModal';
import {ManageFundsModalProps} from './ManageFundsModal';
import ManageFundsModal from './ManageFundsModal';

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
      setMarket,
      isLimitInvalid,
      isStopLimitInvalid
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
    setMarket,
    isLimitInvalid,
    isStopLimitInvalid
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
    getConfirmButtonMessage
  }),
  StopLimitOrder
);

const ConnectedQRModal = connect<QRModalProps>(
  ({
    sessionStore: {getQrId, continueInReadOnlyMode},
    modalStore: {setQRModalState}
  }) => ({
    qrId: getQrId(),
    setQRModalState,
    continueInReadOnlyMode
  }),
  withModal(QRModal)
);

const ConnectedModals = connect<ModalsProps>(
  ({
    modalStore: {
      getQRModalState,
      getMissedKycModalState,
      getSessionConfirmationModalState,
      getManageFundsModalState
    }
  }) => ({
    isQRModalOpen: getQRModalState(),
    isMissedKysModalOpen: getMissedKycModalState(),
    isSessionConfirmationModalOpen: getSessionConfirmationModalState(),
    isManageFundsModalOpen: getManageFundsModalState()
  }),
  Modals
);

const ConnectedMissedKysModal = connect<KycModalProps>(
  ({modalStore: {setMissedKycModalState}}) => ({
    setMissedKycModalState
  }),
  withModal(KycModal)
);

const ConnectedManageFundsModal = connect<ManageFundsModalProps>(
  ({modalStore: {setManageFundsModalState}}) => ({
    setManageFundsModalState
  }),
  withModal(ManageFundsModal)
);

export {ConnectedEditOrderModal as EditOrder};
export {ConnectedQRModal as QRModal};
export {ConnectedEditLimitOrder as EditLimitOrder};
export {ConnectedEditStopLimitOrder as EditStopLimitOrder};
export {ConnectedModals as Modals};
export {ConnectedMissedKysModal as KycModal};
export {ConnectedManageFundsModal as ManageFundsModal};
