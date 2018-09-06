import {mount, shallow} from 'enzyme';
import * as React from 'react';
import {keys} from '../../../constants/keyBoardKeys';
import {OrderInputs} from '../../../models';
import OrderLimit from '../OrderLimit';

describe('<OrderLimit>', () => {
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
  const percents = [
    {
      isActive: true,
      percent: 25
    }
  ];
  const limitAmount = 25;
  const quoteAssetAccuracy = 2;
  const price = '5';
  const handleButtonClick = jest.fn();
  const getConfirmButtonMessage = () => 'confirm message';
  const isButtonDisable = false;
  const isOrderInvalid = () => true;
  const baseAssetId = 'BTC';
  const quoteAssetId = 'USD';

  const getTestOrderLimit = () => {
    return (
      <OrderLimit
        onPriceArrowClick={onPriceArrowClick}
        onAmountArrowClick={onAmountArrowClick}
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
        limitAmount={limitAmount}
        quoteAssetAccuracy={quoteAssetAccuracy}
        price={price}
        handleButtonClick={handleButtonClick}
        getConfirmButtonMessage={getConfirmButtonMessage}
        isButtonDisable={isButtonDisable}
        isOrderInvalid={isOrderInvalid}
        isCurrentSideSell={true}
        baseAssetId={baseAssetId}
        quoteAssetId={quoteAssetId}
      />
    );
  };

  it('should render 2 input controls', () => {
    const wrapper = shallow(getTestOrderLimit());
    expect(wrapper.find('InputControl')).toHaveLength(2);
  });

  it('should contain input control with order title', () => {
    const inputControl = shallow(getTestOrderLimit())
      .find('InputControl')
      .first();
    expect(inputControl.find('OrderTitle')).toHaveLength(1);
    expect(inputControl.html()).toContain(`Price (${quoteAssetName})`);
  });

  it('should contain price input', () => {
    const wrapper = shallow(getTestOrderLimit());
    expect(
      wrapper
        .find('NumberInput')
        .findWhere(n => n.props().id === OrderInputs.Price)
    ).toHaveLength(1);
  });

  it('should contain amount input', () => {
    const wrapper = shallow(getTestOrderLimit());
    expect(
      wrapper
        .find('NumberInput')
        .findWhere(n => n.props().id === OrderInputs.Amount)
    ).toHaveLength(1);
  });

  it('should contain Percentage component', () => {
    const wrapper = shallow(getTestOrderLimit());
    expect(wrapper.find('OrderPercentage')).toHaveLength(1);
  });

  describe('Percentage', () => {
    it('should contain percents prop', () => {
      const wrapper = shallow(getTestOrderLimit());
      const percentage = wrapper.find('OrderPercentage');
      expect((percentage.props() as any).percents).toBe(percents);
    });

    it('should contain isDisabled prop', () => {
      const wrapper = shallow(getTestOrderLimit());
      const percentage = wrapper.find('OrderPercentage');
      expect((percentage.props() as any).isDisabled).toBe(!balance);
    });
  });

  it('should contain OrderTotal component', () => {
    const wrapper = shallow(getTestOrderLimit());
    expect(wrapper.find('OrderTotal')).toHaveLength(1);
  });

  describe('Order total', () => {
    it('should contain OrderTitle component with Total text', () => {
      const orderTotal = shallow(getTestOrderLimit()).find('OrderTotal');
      const title = orderTotal.find('OrderTotal').find('OrderTitle');
      expect(title).toHaveLength(1);
      expect(title.children().text()).toBe('Total');
    });

    it('should contain Amount component with formatted amount', () => {
      const orderTotal = shallow(getTestOrderLimit()).find('OrderTotal');
      const orderAmount = orderTotal.find('OrderTotal').find('Amount');
      expect(orderAmount).toHaveLength(1);
      expect(orderAmount.html()).toContain(`25.00 USD`);
    });
  });

  it('should contain OrderButton', () => {
    const wrapper = shallow(getTestOrderLimit());
    expect(wrapper.find('OrderButton')).toHaveLength(1);
  });

  describe('Order button', () => {
    it('should contain OrderConfirmButton', () => {
      const orderButton = shallow(getTestOrderLimit()).find('OrderButton');
      const orderConfirmButton = orderButton.find('OrderConfirmButton');
      expect(orderConfirmButton).toHaveLength(1);
    });

    it('should contain message prop', () => {
      const orderButton = shallow(getTestOrderLimit()).find('OrderButton');
      const orderConfirmButton = orderButton.find('OrderConfirmButton');
      expect((orderConfirmButton.props() as any).message).toBe(
        getConfirmButtonMessage()
      );
    });

    it('should contain isDisable prop', () => {
      const isConfirmButtonDisable = isButtonDisable || isOrderInvalid();
      const orderButton = shallow(getTestOrderLimit()).find('OrderButton');
      const orderConfirmButton = orderButton.find('OrderConfirmButton');
      expect((orderConfirmButton.props() as any).isDisable).toBe(
        isConfirmButtonDisable
      );
    });

    it('should contain type prop', () => {
      const orderButton = shallow(getTestOrderLimit()).find('OrderButton');
      const orderConfirmButton = orderButton.find('OrderConfirmButton');
      expect((orderConfirmButton.props() as any).type).toBe('button');
    });
  });

  it('should contain action with base asset name', () => {
    const wrapper = shallow(getTestOrderLimit());
    expect(wrapper.find('Action')).toHaveLength(1);
    expect(wrapper.find('Action').html()).toContain(
      `Amount (${baseAssetName})`
    );
  });

  it('should contain Available with balance info', () => {
    const wrapper = shallow(getTestOrderLimit());
    expect(wrapper.find('Available')).toHaveLength(1);
    expect(wrapper.find('Available').html()).toContain(
      `1,000.00 BTC available`
    );
  });

  describe('events', () => {
    describe('price input', () => {
      const wrapper = mount(getTestOrderLimit());
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
      const wrapper = mount(getTestOrderLimit());
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

    describe('percent', () => {
      it('should call updatePercentState', () => {
        const wrapper = mount(getTestOrderLimit());
        const percent = wrapper
          .find('OrderPercentage')
          .find('StyledPercent')
          .first();

        percent.simulate('click');
        expect(updatePercentState).toHaveBeenCalled();
      });

      it('should call updatePercentState after clicking available', () => {
        const wrapper = mount(getTestOrderLimit());
        const available = wrapper.find('Available');

        available.simulate('click');
        expect(updatePercentState).toHaveBeenCalled();
      });

      it('should not call updatePercentState', () => {
        jest.resetAllMocks();
        balance = 0;

        const wrapper = mount(getTestOrderLimit());
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
