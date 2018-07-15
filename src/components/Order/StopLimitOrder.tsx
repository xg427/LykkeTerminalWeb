import * as React from 'react';
import {ArrowDirection, OrderInputs, Side} from '../../models';
import formattedNumber from '../../utils/localFormatted/localFormatted';
import {precisionFloor} from '../../utils/math';
import NumberInput from '../NumberInput/NumberInput';
import OrderConfirmButton from './OrderConfirmButton';
import {
  Amount,
  Available,
  InputControl,
  OrderButton,
  OrderTitle,
  OrderTotal
} from './styles';

// tslint:disable-next-line:no-var-requires
const {Flex} = require('grid-styled');

interface StopLimitOrderProps {
  onPriceArrowClick: (direction: ArrowDirection) => () => void;
  onAmountArrowClick: (direction: ArrowDirection) => () => void;
  onPriceChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  stopPriceValue: string;
  amountValue: string;
  priceValue: string;
  onStopPriceChange: (value: string) => void;
  onStopPriceArrowClick: (operation: ArrowDirection) => void;
  amountAssetName: string;
  priceAssetName: string;
  stopPriceAssetName: string;
  isCurrentSideSell: boolean;
  balance: number;
  balanceAccuracy: number;
}

const StopLimitOrder: React.SFC<StopLimitOrderProps> = ({
  onPriceArrowClick,
  onPriceChange,
  stopPriceValue,
  onStopPriceChange,
  onStopPriceArrowClick,
  onAmountArrowClick,
  onAmountChange,
  amountValue,
  priceValue,
  priceAssetName,
  amountAssetName,
  stopPriceAssetName,
  isCurrentSideSell,
  balance,
  balanceAccuracy
}) => {
  const handleStopPriceChange = () => (e: any) => {
    onStopPriceChange(e.target.value);
  };

  const handleStopPriceArrowClick = (operation: ArrowDirection) => () => {
    onStopPriceArrowClick(operation);
  };

  const handleAmountChange = () => (e: any) => {
    onAmountChange(e.target.value);
  };

  const handleAmountArrowClick = (operation: ArrowDirection) => () => {
    onAmountArrowClick(operation);
  };

  const handlePriceChange = () => (e: any) => {
    onPriceChange(e.target.value);
  };

  const handlePriceArrowClick = (operation: ArrowDirection) => () => {
    onPriceArrowClick(operation);
  };

  const isStopLimitAmountInvalid = () => {
    return +stopPriceValue <= 0;
  };

  const amount = isCurrentSideSell
    ? precisionFloor(+priceValue * +amountValue, 2)
    : precisionFloor(+amountValue / +priceValue, 2);

  const getButtonMessage = () => {
    return `${
      isCurrentSideSell ? Side.Sell : Side.Buy
    } ${amount} ${amountAssetName}`;
  };

  return (
    <React.Fragment>
      <InputControl style={{borderBottom: '1px solid #333'}}>
        <Flex justify={'space-between'} style={{marginBottom: '7px'}}>
          <OrderTitle>Stop Price ({stopPriceAssetName})</OrderTitle>
        </Flex>
        <NumberInput
          value={stopPriceValue}
          id={OrderInputs.StopLimitPrice}
          onChange={handleStopPriceChange}
          onArrowClick={handleStopPriceArrowClick}
        />
      </InputControl>
      <InputControl style={{borderBottom: '1px solid #333'}}>
        <Flex justify={'space-between'} style={{marginBottom: '7px'}}>
          <OrderTitle>Amount ({amountAssetName})</OrderTitle>
          <Available>
            {formattedNumber(balance || 0, balanceAccuracy)}{' '}
            {isCurrentSideSell ? amountAssetName : priceAssetName} available
          </Available>
        </Flex>
        <NumberInput
          value={amountValue}
          id={OrderInputs.Amount}
          onChange={handleAmountChange}
          onArrowClick={handleAmountArrowClick}
        />
      </InputControl>
      <InputControl style={{borderBottom: '1px solid #333'}}>
        <Flex justify={'space-between'} style={{marginBottom: '7px'}}>
          <OrderTitle>Limit Price ({priceAssetName})</OrderTitle>
        </Flex>
        <NumberInput
          value={priceValue}
          id={OrderInputs.Price}
          onChange={handlePriceChange}
          onArrowClick={handlePriceArrowClick}
        />
      </InputControl>
      <OrderTotal>
        <OrderTitle>Total</OrderTitle>
        <Amount>
          {amount} {amountAssetName}
        </Amount>
      </OrderTotal>

      <OrderButton>
        <OrderConfirmButton
          isDisable={isStopLimitAmountInvalid()}
          type={'button'}
          message={getButtonMessage()}
        />
      </OrderButton>
    </React.Fragment>
  );
};

export default StopLimitOrder;
