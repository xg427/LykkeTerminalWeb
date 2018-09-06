import {curry, pathOr} from 'rambda';
import * as React from 'react';
import {AnalyticsEvents} from '../../constants/analyticsEvents';
import {Percentage} from '../../constants/ordersPercentage';
import {AssetBalanceModel, OrderInputs, OrderModel} from '../../models';
import Side from '../../models/side';
import {AnalyticsService} from '../../services/analyticsService';
import {IPercentage, Percentage} from '../../constants/ordersPercentage';
import {
  AssetBalanceModel,
  InstrumentModel,
  OrderModel,
  OrderType
} from '../../models';
import Side from '../../models/side';
import {setActivePercentage} from '../../utils/order';
  DEFAULT_INPUT_VALUE,
  onArrowClick,
  onValueChange
} from '../../utils/inputNumber';
import {formattedNumber} from '../../utils/localFormatted/localFormatted';
import {bigToFixed, precisionFloor} from '../../utils/math';
import {
  getPercentOfValueForLimit,
  isAmountExceedLimitBalance,
  resetPercentage,
  setActivePercentage
} from '../../utils/order';
import OrderLimit from '../Order/OrderLimit';
import ModalHeader from './ModalHeader/ModalHeader';
import {EditActionTitle, EditModal, EditTitle} from './styles';

import {
  OrderRequestBody,
  RequestBody,
  StopLimitRequestBody
} from '../../api/orderApi';
import {EditLimitOrder, EditStopLimitOrder} from './index';

const EDIT_LIMIT_TITLE = 'Edit Limit Order';
const EDIT_STOP_LIMIT_TITLE = 'Edit Stop Limit Order';

export interface EditOrderProps {
  getInstrumentById: (id: string) => InstrumentModel;
  editOrder: (body: RequestBody, id: string, type: OrderType) => Promise<void>;
  availableBalances: AssetBalanceModel[];
  order: OrderModel;
  onClose: () => void;
  setPriceValueWithFixed: (value: number) => void;
  setAmountValueWithFixed: (value: number) => void;
  setStopPriceValueWithFixed: (value: number) => void;
  setAmountAccuracy: (accuracy: number) => void;
  setPriceAccuracy: (accuracy: number) => void;
  setSide: (side: Side) => void;
  getOrderRequestBody: (
    baseAssetId: string,
    assetPairId: string
  ) => OrderRequestBody | StopLimitRequestBody;
  setMarket: (market: OrderType) => void;
  isLimitInvalid: (balance: number, accuracy: number) => boolean;
  isStopLimitInvalid: (balance: number, accuracy: number) => boolean;
}

interface EditOrderState {
  pendingOrder: boolean;
  percents: IPercentage[];
}

class EditOrder extends React.Component<EditOrderProps, EditOrderState> {
  state = {
    pendingOrder: false,
    percents: Percentage.map(p => Object.assign({}, {...p}))
  };

  private action: string;
  private accuracy: {
    priceAccuracy: number;
    amountAccuracy: number;
    quoteAssetAccuracy: number;
  };
  private baseAssetName: string = '';
  private quoteAssetName: string = '';
  private baseAssetId: string = '';
  private quoteAssetId: string = '';
  private assetPairId: string = '';
  private isSellActive: boolean;
  private balance: number = 0;
  private balanceAccuracy: number;

  componentWillMount() {
    const {order, getInstrumentById, availableBalances} = this.props;
    const currentInstrument = getInstrumentById(order.symbol);

    this.accuracy = {
      priceAccuracy: pathOr(2, ['accuracy'], currentInstrument),
      amountAccuracy: pathOr(2, ['baseAsset', 'accuracy'], currentInstrument),
      quoteAssetAccuracy: pathOr(
        2,
        ['quoteAsset', 'accuracy'],
        currentInstrument
      )
    };

    this.baseAssetName = currentInstrument.baseAsset.name;
    this.quoteAssetName = currentInstrument.quoteAsset.name;
    this.baseAssetId = currentInstrument.baseAsset.id;
    this.quoteAssetId = currentInstrument.quoteAsset.id;
    this.action = order.side;
    this.assetPairId = currentInstrument.id;
    this.isSellActive = this.action === Side.Sell;

    let currentMarket: OrderType;

    if (this.props.order.type === OrderType.Limit) {
      this.setEditingLimitOrders(currentInstrument, order);
      currentMarket = OrderType.Limit;
    } else {
      this.setEditingStopLimitOrders(currentInstrument, order);
      currentMarket = OrderType.StopLimit;
    }

    this.props.setMarket(currentMarket);

    const assetId = this.isSellActive ? this.baseAssetId : this.quoteAssetId;
    const asset: AssetBalanceModel = availableBalances.find(
      (b: AssetBalanceModel) => {
        return b.id === assetId;
      }
    )!;
    const reserved = this.isSellActive
      ? order.volume
      : order.volume * order.price;
    this.balanceAccuracy = this.isSellActive
      ? this.accuracy.amountAccuracy
      : pathOr(2, ['quoteAsset', 'accuracy'], currentInstrument);
    this.balance = asset.available + reserved;
  }

  setEditingLimitOrders = (
    currentInstrument: InstrumentModel,
    order: OrderModel
  ) => {
    const {
      setPriceAccuracy,
      setAmountAccuracy,
      setPriceValueWithFixed,
      setAmountValueWithFixed,
      setSide
    } = this.props;

    setPriceAccuracy(pathOr(2, ['accuracy'], currentInstrument));
    setAmountAccuracy(pathOr(2, ['baseAsset', 'accuracy'], currentInstrument));

    setPriceValueWithFixed(order.price);
    setAmountValueWithFixed(order.remainingVolume);
    setSide(order.side);
  };

  setEditingStopLimitOrders = (
    currentInstrument: InstrumentModel,
    order: OrderModel
  ) => {
    this.setEditingLimitOrders(currentInstrument, order);
    this.props.setStopPriceValueWithFixed(order.stopPrice!);
  };

  handleUpdatePercentState = (
    updateAmount: (percents: number) => void,
    index: number
  ) => {
    const {updatedPercentage, percents} = setActivePercentage(
      this.state.percents,
      index
    );

    updateAmount(percents);

    this.setState({
      percents: updatedPercentage
    });
  };

  toggleDisableBtn = (value: boolean) => {
    this.setState({
      pendingOrder: value
    });
  };

  handleEditOrder = () => {
    const {getOrderRequestBody, order: {id, type}} = this.props;
    this.toggleDisableBtn(true);
    const body = getOrderRequestBody(this.baseAssetId, this.assetPairId);

    this.props
      .editOrder(body, id, type)
      .then(this.handleClose)
      .catch(() => this.toggleDisableBtn(false));
    AnalyticsService.track(AnalyticsEvents.FinishOrderEdit);
  };

  handleClose = () => {
    this.props.onClose();
    AnalyticsService.track(AnalyticsEvents.CancelOrderEdit);
  };

  resetPercents = () => {
    this.setState({
      percents: Percentage.map(p => Object.assign({}, {...p}))
    });
  };

  render() {
    const isOrderLimit = this.props.order.type === OrderType.Limit;
    return (
      <EditModal isSell={this.isSellActive}>
        <ModalHeader onClick={this.handleClose}>
          <EditActionTitle isSell={this.isSellActive}>
            {this.action}
          </EditActionTitle>
          <EditTitle>
            {isOrderLimit ? EDIT_LIMIT_TITLE : EDIT_STOP_LIMIT_TITLE}
          </EditTitle>
        </ModalHeader>

        {isOrderLimit && (
          <EditLimitOrder
            percents={this.state.percents}
            updatePercentState={this.handleUpdatePercentState}
            balance={this.balance}
            balanceAccuracy={this.balanceAccuracy}
            isCurrentSideSell={this.isSellActive}
            baseAssetId={this.baseAssetId}
            quoteAssetId={this.quoteAssetId}
            availableAssetName={
              this.isSellActive ? this.baseAssetName : this.quoteAssetName
            }
            baseAssetName={this.baseAssetName}
            quoteAssetName={this.quoteAssetName}
            quoteAssetAccuracy={this.accuracy.quoteAssetAccuracy}
            resetPercents={this.resetPercents}
            handleButtonClick={this.handleEditOrder}
            isButtonDisable={this.state.pendingOrder}
            isOrderInvalid={curry(this.props.isLimitInvalid)(this.balance)}
          />
        )}

        {!isOrderLimit && (
          <EditStopLimitOrder
            percents={this.state.percents}
            updatePercentState={this.handleUpdatePercentState}
            balance={this.balance}
            balanceAccuracy={this.balanceAccuracy}
            isCurrentSideSell={this.isSellActive}
            baseAssetId={this.baseAssetId}
            quoteAssetId={this.quoteAssetId}
            availableAssetName={
              this.isSellActive ? this.baseAssetName : this.quoteAssetName
            }
            baseAssetName={this.baseAssetName}
            quoteAssetName={this.quoteAssetName}
            quoteAssetAccuracy={this.accuracy.quoteAssetAccuracy}
            resetPercents={this.resetPercents}
            handleButtonClick={this.handleEditOrder}
            isButtonDisable={this.state.pendingOrder}
            isOrderInvalid={curry(this.props.isStopLimitInvalid)(this.balance)}
          />
        )}
      </EditModal>
    );
  }
}

export default EditOrder;
