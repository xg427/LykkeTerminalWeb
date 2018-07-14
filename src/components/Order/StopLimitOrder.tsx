import * as React from 'react';
import {ArrowDirection, OrderInputs} from '../../models';
import NumberInput from '../NumberInput/NumberInput';
import {InputControl, LimitTitle} from './styles';

// tslint:disable-next-line:no-var-requires
const {Flex} = require('grid-styled');

interface StopLimitOrderProps {
  onPriceArrowClick: (direction: ArrowDirection) => () => void;
  onQuantityArrowClick: (direction: ArrowDirection) => () => void;
  onPriceChange: () => void;
  onQuantityChange: () => void;
  stopPriceValue: string;
  onStopPriceChange: (value: string) => void;
  onStopPriceArrowClick: (operation: string) => void;
}

const StopLimitOrder: React.SFC<StopLimitOrderProps> = ({
  onPriceArrowClick,
  onPriceChange,
  stopPriceValue,
  onStopPriceChange,
  onStopPriceArrowClick
}) => {
  const handleStopPriceChange = () => (e: any) => {
    onStopPriceChange(e.target.value);
  };

  const handleStopPriceArrowClick = (operation: string) => () => {
    onStopPriceArrowClick(operation);
  };

  return (
    <React.Fragment>
      <InputControl style={{borderBottom: '1px solid #333'}}>
        <Flex justify={'space-between'} style={{marginBottom: '7px'}}>
          <LimitTitle>Stop Price ({})</LimitTitle>
        </Flex>
        <NumberInput
          value={stopPriceValue}
          id={OrderInputs.StopLimitPrice}
          onChange={handleStopPriceChange}
          onArrowClick={handleStopPriceArrowClick}
        />
      </InputControl>
    </React.Fragment>
  );
};

export default StopLimitOrder;
