import * as React from 'react';
import Side from '../../models/side';
import {ActionButton, ActionProperty} from './styles';

interface ActionChoiceButtonProps {
  title: Side;
  click: () => void;
  isActive: boolean;
}

const ActionChoiceButton: React.SFC<ActionChoiceButtonProps> = ({
  title,
  click,
  isActive
}) => (
  <ActionButton side={title}>
    <ActionProperty onClick={click} side={title} isActive={isActive}>
      {title}
    </ActionProperty>
  </ActionButton>
);

export default ActionChoiceButton;
