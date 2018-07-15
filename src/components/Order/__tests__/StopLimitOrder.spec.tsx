import {shallow} from 'enzyme';
import * as React from 'react';

import {ArrowDirection, OrderInputs} from '../../../models';
import StopLimitOrder from '../StopLimitOrder';

describe('<StopLimitOrder>', () => {
  const getTestStopLimitOrder = () => {
    return (
      <StopLimitOrder
        // tslint:disable:jsx-no-lambda
        // tslint:disable:no-empty
        onPriceArrowClick={(direction: ArrowDirection) => () => {}}
        onAmountArrowClick={(direction: ArrowDirection) => () => {}}
        onPriceChange={() => {}}
        onAmountChange={() => {}}
        stopPriceValue={'0'}
        amountValue={'0'}
        priceValue={'0'}
        onStopPriceChange={(value: string) => {}}
        onStopPriceArrowClick={(operation: string) => {}}
        stopPriceAssetName={'BTC'}
        priceAssetName={'USD'}
        amountAssetName={'USD'}
        isCurrentSideSell={true}
        balance={1}
        balanceAccuracy={1}
      />
    );
  };

  it('should contain input for stop limit price', () => {
    const wrapper = shallow(getTestStopLimitOrder());
    expect(
      wrapper
        .find('NumberInput')
        .findWhere(n => n.props().id === OrderInputs.StopLimitPrice)
    ).toHaveLength(1);
  });

  it('should contain input for amount', () => {
    const wrapper = shallow(getTestStopLimitOrder());
    expect(
      wrapper
        .find('NumberInput')
        .findWhere(n => n.props().id === OrderInputs.Amount)
    ).toHaveLength(1);
  });

  it('should contain input for price', () => {
    const wrapper = shallow(getTestStopLimitOrder());
    expect(
      wrapper
        .find('NumberInput')
        .findWhere(n => n.props().id === OrderInputs.Price)
    ).toHaveLength(1);
  });

  it('should contain OrderTotal', () => {
    const wrapper = shallow(getTestStopLimitOrder());
    expect(wrapper.find('OrderTotal')).toHaveLength(1);
    expect(wrapper.find('OrderTotal').find('OrderTitle')).toHaveLength(1);
  });

  it('should contain OrderTotal', () => {
    const wrapper = shallow(getTestStopLimitOrder());
    expect(wrapper.find('OrderButton')).toHaveLength(1);
    expect(wrapper.find('OrderButton').find('OrderConfirmButton')).toHaveLength(
      1
    );
  });
});
