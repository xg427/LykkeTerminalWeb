import classNames from 'classnames';
import * as React from 'react';
import {Percent} from './styles';

interface OrderPercentageProps {
  onClick: any;
  isDisabled: boolean;
  percents: any[];
}

const OrderPercentage: React.SFC<OrderPercentageProps> = ({
  percents,
  onClick,
  isDisabled
}) => {
  const handleClick = (index: number) => () => onClick(index);

  const className = classNames({
    active: isActive,
    disabled: isDisabled
  });

  return (
    <React.Fragment>
      {percents!.map((item: any, index: number) => (
        <Percent
          key={index}
          disabled={isDisabled}
          className={className}
          onClick={handleClick(index)}
        >
          <div>{item.percent}%</div>
        </Percent>
      ))}
    </React.Fragment>
  );
};

OrderPercentage.displayName = 'OrderPercentage';
StyledPercent.displayName = 'StyledPercent';
export default OrderPercentage;
