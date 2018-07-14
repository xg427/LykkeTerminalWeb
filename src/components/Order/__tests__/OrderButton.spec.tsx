import {shallow} from 'enzyme';
import * as React from 'react';

import OrderConfirmButton from '../OrderConfirmButton';

describe('<OrderConfirmButton>', () => {
  const message = 'button message';
  const type = 'submit';
  const isDisable = true;

  let confirmButton: any;

  const getTestOrderButton = () => {
    return (
      <OrderConfirmButton message={message} type={type} isDisable={isDisable} />
    );
  };

  beforeEach(() => {
    const wrapper = shallow(getTestOrderButton());
    confirmButton = wrapper.find('ConfirmButton');
  });

  it('should present', () => {
    expect(confirmButton).toHaveLength(1);
  });

  it('should contain disabled and type props', () => {
    expect(confirmButton.props().disabled).toBe(isDisable);
    expect(confirmButton.props().type).toBe(type);
  });

  it('should contain text with message value', () => {
    expect(confirmButton.children().text()).toBe(message);
  });
});
