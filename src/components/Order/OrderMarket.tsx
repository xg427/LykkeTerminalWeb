import {curry} from 'rambda';
import * as React from 'react';
import indicativeTotalHint from '../../constants/indicativeTotalHint';
import {ArrowDirection, OrderInputs} from '../../models';
import {formattedNumber} from '../../utils/localFormatted/localFormatted';
import NumberInput from '../NumberInput/NumberInput';
import {CommonOrderProps} from './index';
import OrderConfirmButton from './OrderConfirmButton';
import OrderPercentage from './OrderPercentage';
import {
  Available,
  InputControl,
  MarketAmount,
  OrderButton,
  OrderTitle,
  OrderTotal,
  TotalHint
} from './styles';

// tslint:disable-next-line:no-var-requires
const {Flex} = require('grid-styled');

interface MarketOrderProps extends CommonOrderProps {
  handlePercentageChange: (
    balance: number,
    quoteAssetId: string,
    baseAssetId: string,
    percents: number
  ) => void;
  marketAmount: number;
  setMarketTotal: (volume?: any, action?: string, debounce?: boolean) => void;
  isEnoughLiquidity: boolean;
  isCurrentSideSell: boolean;
}

const OrderMarket: React.SFC<MarketOrderProps> = ({
  onAmountArrowClick,
  onAmountChange,
  amount,
  balance,
  handlePercentageChange,
  updatePercentState,
  quoteAssetId,
  baseAssetId,
  baseAssetName,
  balanceAccuracy,
  availableAssetName,
  percents,
  resetPercents,
  handleButtonClick,
  getConfirmButtonMessage,
  isOrderInvalid,
  isButtonDisable,
  quoteAssetAccuracy,
  setMarketTotal,
  isEnoughLiquidity,
  quoteAssetName,
  isCurrentSideSell
}) => {
  const handleArrowClick = (operation: ArrowDirection) => () => {
    onAmountArrowClick(operation);
    resetPercents();
  };

  const handleChange = () => (e: any) => {
    setMarketTotal(e.target.value);
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
    return (
      isButtonDisable ||
      isOrderInvalid(quoteAssetAccuracy, baseAssetId, quoteAssetId) ||
      isEnoughLiquidity
    );
  };

  return (
    <React.Fragment>
      <InputControl style={{width: '100%'}}>
        <Flex justify="space-between" style={{marginBottom: '8px'}}>
          <OrderTitle>{`Amount (${baseAssetName})`}</OrderTitle>
          {/* tslint:disable-next-line:jsx-no-lambda */}
          <Available onClick={() => handlePercentsClick()}>
            {formattedNumber(balance || 0, balanceAccuracy)}{' '}
            {availableAssetName} available
          </Available>
        </Flex>
        <NumberInput
          value={amount}
          id={OrderInputs.Amount}
          onChange={handleChange}
          onArrowClick={handleArrowClick}
        />
      </InputControl>
      <Flex justify={'space-between'} style={{width: '100%'}}>
        <OrderPercentage
          percents={percents}
          onClick={handlePercentsClick}
          isDisabled={!balance}
        />
      </Flex>

      <OrderTotal>
        <OrderTitle className={'estimated-total'}>Estimated total</OrderTitle>
        <MarketAmount available={isEnoughLiquidity}>
          {isEnoughLiquidity ? `${amount} ${quoteAssetName}` : '--'}
          <TotalHint>
            {isEnoughLiquidity
              ? isCurrentSideSell
                ? indicativeTotalHint.sell
                : indicativeTotalHint.buy
              : indicativeTotalHint.na}
          </TotalHint>
        </MarketAmount>
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

export default OrderMarket;
