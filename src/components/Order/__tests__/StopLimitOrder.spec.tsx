import {mount, shallow} from 'enzyme';
import * as React from 'react';

import {keys} from '../../../constants/keyBoardKeys';
import {OrderInputs} from '../../../models';
import StopLimitOrder from '../StopLimitOrder';

describe('<StopLimitOrder>', () => {
  const onPriceArrowClick = jest.fn();
  const onAmountArrowClick = jest.fn();
  const resetPercents = jest.fn();
  const onPriceChange = jest.fn();
  const onAmountChange = jest.fn();
  let balance = 1000;
  const handlePercentageChange = jest.fn();
  const updatePercentState = jest.fn();
  const quoteAssetName = 'USD';
  const baseAssetName = 'BTC';
  const balanceAccuracy = 3;
  const availableAssetName = 'BTC';
  const amount = '5';
  const stopPrice = '5';
  const percents = [
    {
      isActive: true,
      percent: 25
    }
  ];
  const stopLimitAmount = 25;
  const quoteAssetAccuracy = 2;
  const price = '5';
  const handleButtonClick = jest.fn();
  const getConfirmButtonMessage = () => 'confirm message';
  const isButtonDisable = false;
  const isOrderInvalid = () => true;
  const baseAssetId = 'BTC';
  const quoteAssetId = 'USD';
  const onStopPriceChange = jest.fn();
  const onStopPriceArrowClick = jest.fn();

  const getTestStopLimitOrder = () => {
    return (
      <StopLimitOrder
        onPriceArrowClick={onPriceArrowClick}
        onAmountArrowClick={onAmountArrowClick}
        onStopPriceChange={onStopPriceChange}
        onStopPriceArrowClick={onStopPriceArrowClick}
        resetPercents={resetPercents}
        onPriceChange={onPriceChange}
        onAmountChange={onAmountChange}
        balance={balance}
        handlePercentageChange={handlePercentageChange}
        updatePercentState={updatePercentState}
        quoteAssetName={quoteAssetName}
        baseAssetName={baseAssetName}
        balanceAccuracy={balanceAccuracy}
        availableAssetName={availableAssetName}
        amount={amount}
        percents={percents}
        stopLimitAmount={stopLimitAmount}
        quoteAssetAccuracy={quoteAssetAccuracy}
        price={price}
        handleButtonClick={handleButtonClick}
        getConfirmButtonMessage={getConfirmButtonMessage}
        isButtonDisable={isButtonDisable}
        isOrderInvalid={isOrderInvalid}
        isCurrentSideSell={true}
        baseAssetId={baseAssetId}
        quoteAssetId={quoteAssetId}
        stopPrice={stopPrice}
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

  it('first input control should contain OrderTitle with stop price', () => {
    const orderTitle = shallow(getTestStopLimitOrder())
      .find('InputControl')
      .find('OrderTitle')
      .first();
    expect(orderTitle).toHaveLength(1);
    expect(orderTitle.html()).toContain(`Stop Price (${quoteAssetName})`);
  });

  it('second input control should contain OrderTitle with amount', () => {
    const orderTitle = shallow(getTestStopLimitOrder())
      .find('InputControl')
      .find('OrderTitle')
      .at(1);
    expect(orderTitle).toHaveLength(1);
    expect(orderTitle.html()).toContain(`Amount (${baseAssetName})`);
  });

  it('fourth input control should contain OrderTitle with limit price', () => {
    const orderTitle = shallow(getTestStopLimitOrder())
      .find('InputControl')
      .find('OrderTitle')
      .at(2);
    expect(orderTitle).toHaveLength(1);
    expect(orderTitle.html()).toContain(`Limit Price (${quoteAssetName})`);
  });

  it('should contain OrderTotal component', () => {
    const wrapper = shallow(getTestStopLimitOrder());
    expect(wrapper.find('OrderTotal')).toHaveLength(1);
  });

  describe('Order total', () => {
    it('should contain OrderTitle component with Total text', () => {
      const orderTotal = shallow(getTestStopLimitOrder()).find('OrderTotal');
      const title = orderTotal.find('OrderTotal').find('OrderTitle');
      expect(title).toHaveLength(1);
      expect(title.children().text()).toBe('Total');
    });

    it('should contain Amount component with formatted amount', () => {
      const orderTotal = shallow(getTestStopLimitOrder()).find('OrderTotal');
      const orderAmount = orderTotal.find('OrderTotal').find('Amount');
      expect(orderAmount).toHaveLength(1);
      expect(orderAmount.html()).toContain(`25.00 USD`);
    });
  });

  describe('events', () => {
    describe('price input', () => {
      const wrapper = mount(getTestStopLimitOrder());
      const priceInput = wrapper
        .find('NumberInput')
        .findWhere(n => n.props().id === OrderInputs.Price)
        .find('input');

      it('should call onPriceChange', () => {
        priceInput.simulate('change');
        expect(onPriceChange).toHaveBeenCalled();
      });

      it('should call onPriceArrowClick', () => {
        const event = {
          keyCode: keys.down,
          preventDefault: () => {
            return;
          }
        };

        priceInput.simulate('keyDown', event);
        expect(onPriceArrowClick).toHaveBeenCalled();
      });
    });

    describe('amount input', () => {
      const wrapper = mount(getTestStopLimitOrder());
      const amountInput = wrapper
        .find('NumberInput')
        .findWhere(n => n.props().id === OrderInputs.Amount)
        .find('input');

      it('should call onAmountChange', () => {
        amountInput.simulate('change');
        expect(onAmountChange).toHaveBeenCalled();
      });

      it('should call onAmountArrowClick', () => {
        const event = {
          keyCode: keys.down,
          preventDefault: () => {
            return;
          }
        };

        amountInput.simulate('keyDown', event);
        expect(onAmountArrowClick).toHaveBeenCalled();
      });
    });

    describe('stop limit price input', () => {
      const wrapper = mount(getTestStopLimitOrder());
      const stopLimitPriceInput = wrapper
        .find('NumberInput')
        .findWhere(n => n.props().id === OrderInputs.StopLimitPrice)
        .find('input');

      it('should call onStopPriceChange', () => {
        stopLimitPriceInput.simulate('change');
        expect(onStopPriceChange).toHaveBeenCalled();
      });

      it('should call onStopPriceArrowClick', () => {
        const event = {
          keyCode: keys.down,
          preventDefault: () => {
            return;
          }
        };

        stopLimitPriceInput.simulate('keyDown', event);
        expect(onStopPriceArrowClick).toHaveBeenCalled();
      });
    });

    describe('percent', () => {
      it('should call updatePercentState', () => {
        const wrapper = mount(getTestStopLimitOrder());
        const percent = wrapper
          .find('OrderPercentage')
          .find('StyledPercent')
          .first();

        percent.simulate('click');
        expect(updatePercentState).toHaveBeenCalled();
      });

      it('should call updatePercentState after clicking available', () => {
        const wrapper = mount(getTestStopLimitOrder());
        const available = wrapper.find('Available');

        available.simulate('click');
        expect(updatePercentState).toHaveBeenCalled();
      });

      it('should not call updatePercentState', () => {
        jest.resetAllMocks();
        balance = 0;

        const wrapper = mount(getTestStopLimitOrder());
        const percent = wrapper
          .find('OrderPercentage')
          .find('StyledPercent')
          .first();

        percent.simulate('click');
        expect(updatePercentState).not.toHaveBeenCalled();
      });
    });
  });
});
