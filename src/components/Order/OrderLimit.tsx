import {curry} from 'rambda';
import * as React from 'react';
import {IPercentage} from '../../constants/ordersPercentage';
import {ArrowDirection, OrderInputs} from '../../models';
import {AnalyticsEvents} from '../../constants/analyticsEvents';
import {OrderInputs} from '../../models';
import {AnalyticsService} from '../../services/analyticsService';
import {formattedNumber} from '../../utils/localFormatted/localFormatted';
import {precisionFloor} from '../../utils/math';
import NumberInput from '../NumberInput/NumberInput';
import {CommonOrderProps} from './index';
import OrderConfirmButton from './OrderConfirmButton';
import OrderPercentage from './OrderPercentage';
import {
  Action,
  Amount,
  Available,
  InputControl,
  OrderButton,
  OrderTitle,
  OrderTotal
} from './styles';

// tslint:disable-next-line:no-var-requires
const {Flex} = require('grid-styled');

interface LimitOrderProps extends CommonOrderProps {
  onPriceArrowClick: (operation: ArrowDirection) => void;
  onPriceChange: (value: string) => void;
  price: string;
  handlePercentageChange: (balance: number, percents: number) => void;
  limitAmount: number;
  percents: IPercentage[];
}

const OrderLimit: React.SFC<LimitOrderProps> = ({
  onPriceArrowClick,
  onAmountArrowClick,
  resetPercents,
  onPriceChange,
  onAmountChange,
  balance,
  handlePercentageChange,
  updatePercentState,
  quoteAssetName,
  baseAssetName,
  balanceAccuracy,
  availableAssetName,
  amount,
  percents,
  limitAmount,
  quoteAssetAccuracy,
  price,
  handleButtonClick,
  getConfirmButtonMessage,
  isButtonDisable,
  isOrderInvalid
}) => {
  const handlePriceArrowClick = (operation: ArrowDirection) => () => {
    onPriceArrowClick(operation);
  };

  const handleAmountArrowClick = (operation: ArrowDirection) => () => {
    onAmountArrowClick(operation);
    resetPercents();
  };

  const handlePriceChange = () => (e: any) => {
    onPriceChange(e.target.value);
  };

  const handleAmountChange = () => (e: any) => {
    onAmountChange(e.target.value);
    resetPercents();
  };

  const handlePercentsClick = (index?: number) => {
    if (!balance) {
      return;
    }

    const curriedAmountUpdating = curry(handlePercentageChange)(balance);
    updatePercentState(curriedAmountUpdating, index);
  };

  const isOrderValuesInvalid = () => {
    return isButtonDisable || isOrderInvalid(quoteAssetAccuracy);
  };

  const handlePercentageChange = () => {
    onHandlePercentageChange()();
    AnalyticsService.track(AnalyticsEvents.ClickOnAvailable('Limit'));
  };

  const reset = () => {
    onReset();
    AnalyticsService.track(AnalyticsEvents.ClickOnReset);
  };

  return (
    <React.Fragment>
      <InputControl style={{borderBottom: '1px solid #333'}}>
        <Flex justify={'space-between'} style={{marginBottom: '7px'}}>
          <OrderTitle>Price ({quoteAssetName})</OrderTitle>
        </Flex>
        <NumberInput
          value={price}
          id={OrderInputs.Price}
          onChange={handlePriceChange}
          onArrowClick={handlePriceArrowClick}
        />
      </InputControl>
      <InputControl>
        <Flex justify={'space-between'} style={{marginBottom: '7px'}}>
          <Action>{`Amount (${baseAssetName})`}</Action>
          <Available disabled={!balance} onClick={handlePercentageChange}>
            {formattedNumber(balance || 0, balanceAccuracy)}{' '}
            {availableAssetName} available
          </Available>
        </Flex>
        <NumberInput
          value={amount}
          id={OrderInputs.Amount}
          onChange={handleAmountChange}
          onArrowClick={handleAmountArrowClick}
        />
      </InputControl>
      <Flex justify={'space-between'}>
        <OrderPercentage
          percents={percents}
          onClick={handlePercentsClick}
          isDisabled={!balance}
        />
      </Flex>
      <OrderTotal>
        <OrderTitle>Total</OrderTitle>
        <Amount>
          {formattedNumber(
            precisionFloor(limitAmount, quoteAssetAccuracy),
            quoteAssetAccuracy
          )}{' '}
          {quoteAssetName}
        </Amount>
      </OrderTotal>

      <OrderButton>
        <OrderConfirmButton
          isDisable={isOrderValuesInvalid()}
          type={'button'}
          message={getConfirmButtonMessage(baseAssetName)}
          onClick={handleButtonClick}
        />
      </OrderButton>
    </React.Fragment>
  );
};

export default OrderLimit;
