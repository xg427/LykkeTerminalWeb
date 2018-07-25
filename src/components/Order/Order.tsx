import * as React from 'react';
import {AnalyticsEvents} from '../../constants/analyticsEvents';
import {Percentage} from '../../constants/ordersPercentage';
import {keys} from '../../models';
import {OrderType} from '../../models';
import {AssetModel, OrderInputs, OrderType} from '../../models';
import InstrumentModel from '../../models/instrumentModel';
import Side from '../../models/side';
import {AnalyticsService} from '../../services/analyticsService';
import {StorageUtils} from '../../utils/index';
import {formattedNumber} from '../../utils/localFormatted/localFormatted';
import {precisionFloor} from '../../utils/math';
import {resetPercentage, setActivePercentage} from '../../utils/order';
import withScroll from '../CustomScrollbar/withScroll';
import ConfirmModal from '../Modal/ConfirmModal';
import ActionChoiceButton from './ActionChoiceButton';
import {Disclaimer} from './Disclaimer';
import {OrderLimit, OrderMarket, StopLimitOrder} from './index';
import MarketChoiceButton from './MarketChoiceButton';
import {Actions, Markets, Reset} from './styles';

import {OrderRequestBody} from '../../api/orderApi';
import {IPercentage, Percentage} from '../../constants/ordersPercentage';
import {setActivePercentage} from '../../utils/order';

const confirmStorage = StorageUtils(keys.confirmReminder);

const MARKET = OrderType.Market;
const LIMIT = OrderType.Limit;
const STOP_LIMIT = OrderType.StopLimit;

interface OrderState {
  pendingOrder: boolean;
  isConfirmModalOpen: boolean;
  percents: IPercentage[];
}

interface OrderProps {
  placeOrder: (
    currentMarket: OrderType,
    body: OrderRequestBody
  ) => Promise<any>;
  setMarket: (value: OrderType) => void;
  setSide: (side: Side) => void;
  currentMarket: OrderType;
  isCurrentSideSell: boolean;
  resetOrder: () => void;
  isDisclaimerShown: boolean;
  disclaimedAssets: string[];
  getConfirmationMessage: () => string;
  getOrderRequestBody: () => OrderRequestBody;
}

class Order extends React.Component<OrderProps, OrderState> {
  constructor(props: OrderProps) {
    super(props);
    this.state = {
      pendingOrder: false,
      isConfirmModalOpen: false,
      percents: Percentage.map(p => Object.assign({}, {...p}))
    };
  }

  componentDidMount() {
    this.reset();
  }

  handleSideClick = (side: Side) => () => {
    this.props.setSide(side);
    this.props.setMarketTotal(null, side);
    this.setState({
      percents: percentage
    });

    AnalyticsService.track(AnalyticsEvents.SideSwitch(side));
  };

  handleMarketClick = (market: OrderType) => () => {
    this.reset();
    this.props.setMarket(market);
    this.setState({
      percents: percentage
    });
    switch (market) {
      case LIMIT:
        AnalyticsService.track(AnalyticsEvents.SwitchToLimitOrder);
        break;
      case MARKET:
        AnalyticsService.track(AnalyticsEvents.SwitchToMarketOrder);
        break;
    }
  };

  disableButton = (value: boolean) => {
    this.setState({
      pendingOrder: value
    });
  };

  applyOrder = (body: any) => {
    this.disableButton(true);
    this.closeConfirmModal();
    this.props
      .placeOrder(this.props.currentMarket, body)
      .then(() => {
        this.disableButton(false);

        const amountInBase = formattedNumber(
          convert(
            parseFloat(quantity) * parseFloat(price),
            quoteAssetId,
            baseAsset.id,
            getInstrumentById
          ),
          baseAsset.accuracy
        );
        AnalyticsService.track(
          AnalyticsEvents.OrderPlaced(amountInBase, action, currentMarket)
        );
      })
      .catch(() => this.disableButton(false));
  };

  closeConfirmModal = () => {
    this.setState({
      isConfirmModalOpen: false
    });
  };

  handleButtonClick = () => {
    const isConfirm = confirmStorage.get() as string;
    if (!JSON.parse(isConfirm)) {
      return this.applyOrder(this.props.getOrderRequestBody());
    }
    this.setState({
      isConfirmModalOpen: true
    });
  };

  handleStopLimitButtonClick = () => {
    return this.applyOrder(this.props.getOrderRequestBody());
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

  resetPercents = () => {
    this.setState({
      percents: Percentage.map(p => Object.assign({}, {...p}))
    });
  };

  reset = () => {
    this.props.resetMarketTotal();
    this.props.resetOrder();
    this.resetPercents();
  };

  render() {
    const {
      isDisclaimerShown,
      disclaimedAssets,
      currentMarket,
      isCurrentSideSell
      isCurrentSideSell,
      handlePriceChange,
      handleQuantityChange,
      handlePriceArrowClick,
      handleQuantityArrowClick,
      handleMarketQuantityArrowClick,
      setMarketTotal,
      marketTotalPrice,
      isEnoughLiquidity
    } = this.props;

    return (
      <React.Fragment>
        <Markets>
          <MarketChoiceButton
            title={LIMIT}
            isActive={currentMarket === LIMIT}
            click={this.handleMarketClick(LIMIT)}
          />
          <MarketChoiceButton
            title={MARKET}
            isActive={currentMarket === MARKET}
            click={this.handleMarketClick(MARKET)}
          />
          <MarketChoiceButton
            title={STOP_LIMIT}
            isActive={currentMarket === STOP_LIMIT}
            click={this.handleMarketClick(STOP_LIMIT)}
          />
        </Markets>

        <Actions>
          <ActionChoiceButton
            title={Side.Buy}
            click={this.handleSideClick(Side.Buy)}
            isActive={!isCurrentSideSell}
          />
          <ActionChoiceButton
            title={Side.Sell}
            click={this.handleSideClick(Side.Sell)}
            isActive={isCurrentSideSell}
          />
        </Actions>

        {currentMarket === LIMIT && (
          <OrderLimit
            percents={this.state.percents}
            updatePercentState={this.handleUpdatePercentState}
            resetPercents={this.resetPercents}
            handleButtonClick={this.handleButtonClick}
            isButtonDisable={this.state.pendingOrder}
          />
        )}

        {currentMarket === MARKET && (
          <OrderMarket
            percents={this.state.percents}
            updatePercentState={this.handleUpdatePercentState}
            resetPercents={this.resetPercents}
            handleButtonClick={this.handleButtonClick}
            isButtonDisable={this.state.pendingOrder}
          />
        )}

        {currentMarket === STOP_LIMIT && (
          <StopLimitOrder
            percents={this.state.percents}
            updatePercentState={this.handleUpdatePercentState}
            resetPercents={this.resetPercents}
            handleButtonClick={this.handleStopLimitButtonClick}
            isButtonDisable={this.state.pendingOrder}
          />
        )}

        <Reset justify={'center'}>
          <span onClick={this.reset}>Reset and clear</span>
        </Reset>

        {this.state.isConfirmModalOpen && (
          <ConfirmModal
            // tslint:disable-next-line:jsx-no-lambda
            onApply={() => this.applyOrder(this.props.getOrderRequestBody())}
            onClose={this.closeConfirmModal}
            message={this.props.getConfirmationMessage()}
          />
        )}
        {isDisclaimerShown &&
          disclaimedAssets.map((asset, index) => (
            <Disclaimer asset={asset} key={`${asset}_${index}`} />
          ))}
      </React.Fragment>
    );
  }
}

export default withScroll(Order);
