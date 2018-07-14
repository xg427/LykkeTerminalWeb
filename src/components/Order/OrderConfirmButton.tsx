import * as React from 'react';
import {ConfirmButton} from './styles';

interface OrderButtonProps {
  isDisable: boolean;
  type: string;
  message?: string;
}

const OrderConfirmButton: React.SFC<OrderButtonProps> = ({
  isDisable,
  type,
  message
}) => (
  <ConfirmButton type={type} disabled={isDisable}>
    {message}
  </ConfirmButton>
);

export default OrderConfirmButton;
export {ConfirmButton};
