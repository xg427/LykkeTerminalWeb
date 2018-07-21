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
        onPriceArrowClick={(direction: ArrowDirection) => () => '1'}
        onAmountArrowClick={(direction: ArrowDirection) => () => '1'}
        onPriceChange={() => '1'}
        onAmountChange={() => '1'}
        stopPrice={'0'}
        amount={'0'}
        price={'0'}
        onStopPriceChange={(value: string) => {}}
        onStopPriceArrowClick={(operation: string) => {}}
        baseAssetName={'BTC'}
        quoteAssetName={'USD'}
        isCurrentSideSell={true}
        balance={1}
        balanceAccuracy={1}
        percents={[]}
        handlePercentageChange={() => {}}
        getConfirmButtonMessage={() => 'message'}
        stopLimitAmount={0}
        baseAssetId={'BTC'}
        quoteAssetId={'USD'}
        availableAssetName={'BTC'}
        quoteAssetAccuracy={2}
        updatePercentState={() => {}}
        resetPercents={() => {}}
        handleButtonClick={() => {}}
        isButtonDisable={true}
        isOrderInvalid={() => true}
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

  it('should not contain input for price by default', () => {
    const wrapper = shallow(getTestStopLimitOrder());
    expect(
      wrapper
        .find('NumberInput')
        .findWhere(n => n.props().id === OrderInputs.Price)
    ).toHaveLength(1);
  });

  it('should show input for price by changing isPriceLimitShown', () => {
    const wrapper = shallow(getTestStopLimitOrder());
    wrapper.setState({isPriceLimitShown: false});
    expect(
      wrapper
        .find('NumberInput')
        .findWhere(n => n.props().id === OrderInputs.Price)
    ).toHaveLength(0);
  });

  it('should contain OrderTotal', () => {
    const wrapper = shallow(getTestStopLimitOrder());
    expect(wrapper.find('OrderTotal')).toHaveLength(1);
    expect(wrapper.find('OrderTotal').find('OrderTitle')).toHaveLength(1);
  });

  it('should contain OrderConfirmButton', () => {
    const wrapper = shallow(getTestStopLimitOrder());
    expect(wrapper.find('OrderButton')).toHaveLength(1);
    expect(wrapper.find('OrderButton').find('OrderConfirmButton')).toHaveLength(
      1
    );
  });

  it('should contain OrderPercentage', () => {
    const wrapper = shallow(getTestStopLimitOrder());
    expect(wrapper.find('OrderPercentage')).toHaveLength(1);
    expect(wrapper.find('OrderPercentage')).toHaveLength(1);
  });

  it('should open dialog', () => {
    const wrapper = shallow(getTestStopLimitOrder());
    wrapper.setState({isWarningModalShown: true});
    expect(wrapper.find('Dialog')).toHaveLength(1);
  });
});
