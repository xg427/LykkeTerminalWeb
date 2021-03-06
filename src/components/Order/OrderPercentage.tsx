import classNames from 'classnames';
import * as React from 'react';
import {Percent} from './styles';

interface OrderPercentageProps {
  percent: number;
  isActive: boolean;
  onClick: any;
  isDisabled: boolean;
}

const OrderPercentage: React.SFC<OrderPercentageProps> = ({
  percent,
  isActive,
  onClick,
  isDisabled
}) => {
  const className = classNames({
    active: isActive,
    disabled: isDisabled
  });

  return (
    <Percent className={className} onClick={onClick}>
      <div>{percent}%</div>
    </Percent>
  );
};

export default OrderPercentage;
