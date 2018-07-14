import * as React from 'react';
import {MarketButton, MarketProperty} from './styles';

interface MarketChoiceButtonProps {
  title: string;
  click: () => void;
  isActive: boolean;
}

const MarketChoiceButton: React.SFC<MarketChoiceButtonProps> = ({
  title,
  click,
  isActive
}) => (
  <MarketButton>
    <MarketProperty onClick={click} isActive={isActive}>
      {title}
    </MarketProperty>
  </MarketButton>
);

export default MarketChoiceButton;
