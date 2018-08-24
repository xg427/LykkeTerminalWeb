import {pathOr} from 'rambda';
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

import {OrderRequestBody} from '../../api/orderApi';
import {EditStopLimitOrder} from './index';

export interface EditOrderProps {
  getInstrumentById: any;
  editOrder: any;
  availableBalances: any;
  order: OrderModel;
  onClose: () => void;
  setPriceValueWithFixed: (value: number) => void;
  setAmountValueWithFixed: (value: number) => void;
  setStopPriceValueWithFixed: (value: number) => void;
  setAmountAccuracy: (accuracy: number) => void;
  setPriceAccuracy: (accuracy: number) => void;
  setSide: (side: Side) => void;
  getOrderRequestBody: () => OrderRequestBody;
  setMarket: (market: OrderType) => void;
}

interface EditOrderState {
  pendingOrder: boolean;
  percents: IPercentage[];
}

class EditOrder extends React.Component<EditOrderProps, EditOrderState> {
  private readonly action: string;
  private readonly accuracy: {
    priceAccuracy: number;
    amountAccuracy: number;
    quoteAssetAccuracy: number;
  };
  private readonly baseAssetName: string = '';
  private readonly quoteAssetName: string = '';
  private readonly baseAssetId: string = '';
  private readonly quoteAssetId: string = '';
  private readonly assetPairId: string = '';
  private readonly isSellActive: boolean;
  private readonly balance: number = 0;
  private balanceAccuracy: number;

  constructor(props: EditOrderProps) {
    super(props);

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

    this.state = {
      pendingOrder: false,
      percents: Percentage.map(p => Object.assign({}, {...p}))
    };

    this.baseAssetName = currentInstrument.baseAsset.name;
    this.quoteAssetName = currentInstrument.quoteAsset.name;
    this.baseAssetId = currentInstrument.baseAsset.id;
    this.quoteAssetId = currentInstrument.quoteAsset.id;
    this.action = order.side;
    this.assetPairId = currentInstrument.id;
    this.isSellActive = this.action === Side.Sell;

    this.setEditingLimitOrders(currentInstrument, order);
    this.props.setMarket(OrderType.Limit);

    const assetId = this.isSellActive ? this.baseAssetId : this.quoteAssetId;
    const asset: AssetBalanceModel = availableBalances.find(
      (b: AssetBalanceModel) => {
        return b.id === assetId;
      }
    );
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
    this.props.setPriceAccuracy(pathOr(2, ['accuracy'], currentInstrument));
    this.props.setAmountAccuracy(
      pathOr(2, ['baseAsset', 'accuracy'], currentInstrument)
    );

    this.props.setPriceValueWithFixed(order.price);
    this.props.setAmountValueWithFixed(order.remainingVolume);
    this.props.setSide(order.side);
  };

  setEditingStopLimitOrders = (
    currentInstrument: InstrumentModel,
    order: OrderModel
  ) => {
    this.setEditingLimitOrders(currentInstrument, order);
    this.props.setStopPriceValueWithFixed(order.price);
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
    this.toggleDisableBtn(true);
    const body = this.props.getOrderRequestBody();

    this.props
      .editOrder(body, this.props.order.id)
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
    return (
      <EditModal isSell={this.isSellActive}>
        <ModalHeader onClick={this.handleClose}>
          <EditActionTitle isSell={this.isSellActive}>
            {this.action}
          </EditActionTitle>
          <EditTitle>Edit Limit Order</EditTitle>
        </ModalHeader>
        {/*<EditLimitOrder*/}
        {/*percents={this.state.percents}*/}
        {/*updatePercentState={this.handleUpdatePercentState}*/}
        {/*balance={this.balance}*/}
        {/*balanceAccuracy={this.balanceAccuracy}*/}
        {/*isCurrentSideSell={this.isSellActive}*/}
        {/*baseAssetId={this.baseAssetId}*/}
        {/*quoteAssetId={this.quoteAssetId}*/}
        {/*availableAssetName={this.isSellActive ? this.baseAssetName : this.quoteAssetName}*/}
        {/*baseAssetName={this.baseAssetName}*/}
        {/*quoteAssetName={this.quoteAssetName}*/}
        {/*quoteAssetAccuracy={this.accuracy.quoteAssetAccuracy}*/}
        {/*resetPercents={this.resetPercents}*/}
        {/*handleButtonClick={this.handleEditOrder}*/}
        {/*isButtonDisable={this.state.pendingOrder}*/}
        {/*/>*/}

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
        />
      </EditModal>
    );
  }
}

export default EditOrder;
