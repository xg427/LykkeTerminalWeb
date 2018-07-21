import * as React from 'react';
import {ConfirmButton} from './styles';

interface OrderButtonProps {
  isDisable: boolean;
  type: string;
  message?: string;
  onClick: () => void;
}

const OrderConfirmButton: React.SFC<OrderButtonProps> = ({
  isDisable,
  type,
  message,
  onClick
}) => {
  return (
    <ConfirmButton type={type} disabled={isDisable} onClick={onClick}>
      {message}
    </ConfirmButton>
  );
};

export default OrderConfirmButton;
export {ConfirmButton};
