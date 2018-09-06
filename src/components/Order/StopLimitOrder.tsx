import * as React from 'react';
import {ArrowDirection, OrderInputs} from '../../models';
import formattedNumber from '../../utils/localFormatted/localFormatted';
import NumberInput from '../NumberInput/NumberInput';
import {
  Amount,
  Available,
  InputControl,
  OrderButton,
  OrderTitle,
  OrderTotal
} from './styles';

import OrderPercentage from './OrderPercentage';

import {CommonOrderProps} from './index';

import {curry} from 'rambda';
import OrderConfirmButton from './OrderConfirmButton';
import './style.css';

import {Dialog} from '@lykkex/react-components';
import {precisionFloor} from '../../utils/math';

// tslint:disable-next-line:no-var-requires
const {Flex} = require('grid-styled');

interface StopLimitOrderProps extends CommonOrderProps {
  onPriceArrowClick: (operation: ArrowDirection) => void;
  onPriceChange: (value: string) => void;
  onStopPriceChange: (value: string) => void;
  onStopPriceArrowClick: (operation: ArrowDirection) => void;
  stopPrice: string;
  price: string;
  handlePercentageChange: (balance: number, percents: number) => void;
  stopLimitAmount: number;
}

interface StopLimitOrderState {
  isWarningModalShown: boolean;
}

class StopLimitOrder extends React.Component<
  StopLimitOrderProps,
  StopLimitOrderState
> {
  state = {
    isWarningModalShown: false
  };

  handleStopPriceChange = () => (e: any) => {
    this.props.onStopPriceChange(e.target.value);
  };

  handleStopPriceArrowClick = (operation: ArrowDirection) => () => {
    this.props.onStopPriceArrowClick(operation);
  };

  handleAmountChange = () => (e: any) => {
    this.props.resetPercents();
    this.props.onAmountChange(e.target.value);
  };

  handleAmountArrowClick = (operation: ArrowDirection) => () => {
    this.props.resetPercents();
    this.props.onAmountArrowClick(operation);
  };

  handlePriceChange = () => (e: any) => {
    this.props.onPriceChange(e.target.value);
  };

  handlePriceArrowClick = (operation: ArrowDirection) => () => {
    this.props.onPriceArrowClick(operation);
  };

  handlePercentsClick = (index?: number) => {
    if (!this.props.balance) {
      return;
    }
    const curriedAmountUpdating = curry(this.props.handlePercentageChange)(
      this.props.balance
    );
    this.props.updatePercentState(curriedAmountUpdating, index);
  };

  isOrderInvalid = () => {
    const {isButtonDisable, isOrderInvalid, quoteAssetAccuracy} = this.props;
    return isButtonDisable || isOrderInvalid(quoteAssetAccuracy);
  };

  handleConfirmButtonClick = () => {
    this.setState({
      isWarningModalShown: true
    });
  };

  handlePlaceOrder = () => {
    this.setState({
      isWarningModalShown: false
    });
    this.props.handleButtonClick();
  };

  handleCancelPlaceOrder = () => {
    this.setState({
      isWarningModalShown: false
    });
  };

  render() {
    const {
      price,
      amount,
      stopPrice,
      baseAssetName,
      quoteAssetName,
      balance,
      balanceAccuracy,
      stopLimitAmount,
      quoteAssetAccuracy,
      availableAssetName
    } = this.props;

    return (
      <React.Fragment>
        <InputControl style={{borderBottom: '1px solid #333'}}>
          <Flex justify={'space-between'} style={{marginBottom: '7px'}}>
            <OrderTitle>Stop Price ({quoteAssetName})</OrderTitle>
          </Flex>
          <NumberInput
            value={stopPrice}
            id={OrderInputs.StopLimitPrice}
            onChange={this.handleStopPriceChange}
            onArrowClick={this.handleStopPriceArrowClick}
          />
        </InputControl>

        <InputControl style={{borderBottom: '1px solid #333'}}>
          <Flex justify={'space-between'} style={{marginBottom: '7px'}}>
            <OrderTitle>Amount ({baseAssetName})</OrderTitle>
            {/* tslint:disable-next-line:jsx-no-lambda */}
            <Available onClick={() => this.handlePercentsClick()}>
              {formattedNumber(balance || 0, balanceAccuracy)}{' '}
              {availableAssetName} available
            </Available>
          </Flex>
          <NumberInput
            value={amount}
            id={OrderInputs.Amount}
            onChange={this.handleAmountChange}
            onArrowClick={this.handleAmountArrowClick}
          />
        </InputControl>

        <Flex justify={'space-between'}>
          <OrderPercentage
            percents={this.props.percents}
            onClick={this.handlePercentsClick}
            isDisabled={!balance}
          />
        </Flex>

        <InputControl style={{borderBottom: '1px solid #333'}}>
          <Flex justify={'space-between'} style={{marginBottom: '7px'}}>
            <OrderTitle>Limit Price ({quoteAssetName})</OrderTitle>
          </Flex>
          <NumberInput
            value={price}
            id={OrderInputs.Price}
            onChange={this.handlePriceChange}
            onArrowClick={this.handlePriceArrowClick}
          />
        </InputControl>

        <OrderTotal>
          <OrderTitle>Total</OrderTitle>
          <Amount>
            {formattedNumber(
              precisionFloor(stopLimitAmount, quoteAssetAccuracy),
              quoteAssetAccuracy
            )}{' '}
            {quoteAssetName}
          </Amount>
        </OrderTotal>

        <OrderButton>
          <OrderConfirmButton
            isDisable={this.isOrderInvalid()}
            type={'button'}
            message={this.props.getConfirmButtonMessage(baseAssetName)}
            onClick={this.handleConfirmButtonClick}
          />
        </OrderButton>

        {this.state.isWarningModalShown && (
          <Dialog
            closeable={false}
            title={'Stop-Limit Warning'}
            onCancel={this.handleCancelPlaceOrder}
            onConfirm={this.handlePlaceOrder}
            confirmButton={{
              text: 'place order'
            }}
            cancelButton={{
              text: 'cancel'
            }}
            description={
              'This order may not fill immediately when executed. Are you sure you would like to continue?'
            }
            visible={true}
            className={'stop-limit-warning'}
          />
        )}
      </React.Fragment>
    );
  }
}

(Dialog as any).displayName = 'Dialog';
export default StopLimitOrder;
