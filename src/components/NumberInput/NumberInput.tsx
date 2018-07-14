import * as React from 'react';
import {keys} from '../../constants/keyBoardKeys';
import ArrowDirection from '../../models/arrowDirection';
import {StyledInput, StyledInputNumberComponent} from './styles';

export const DEFAULT_PLACEHOLDER = '0.00';

interface NumberInputProps {
  id?: string;
  value?: string;
  onChange: any;
  onArrowClick: (direction: ArrowDirection) => () => void;
}

const NumberInput: React.SFC<NumberInputProps> = ({
  id,
  value,
  onChange,
  onArrowClick
}) => {
  const handleKeyDown = (e: any) => {
    switch (e.keyCode) {
      case keys.up:
        onArrowClick(ArrowDirection.Up)();
        e.preventDefault();
        break;
      case keys.down:
        onArrowClick(ArrowDirection.Down)();
        e.preventDefault();
        break;
      default:
        break;
    }
  };

  return (
    <StyledInputNumberComponent>
      <StyledInput
        id={id}
        type="text"
        value={value}
        placeholder={DEFAULT_PLACEHOLDER}
        autoComplete={'off'}
        onChange={onChange()}
        onKeyDown={handleKeyDown}
        name={value}
      />
    </StyledInputNumberComponent>
  );
};

export default NumberInput;
