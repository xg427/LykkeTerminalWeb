import {mount, shallow} from 'enzyme';
import * as React from 'react';
import {keys} from '../../../constants/keyBoardKeys';
import {OrderInputs} from '../../../models';
import {formattedNumber} from '../../../utils/localFormatted/localFormatted';
import OrderMarket from '../OrderMarket';

describe('<OrderMarket>', () => {
  const onAmountArrowClick = jest.fn();
  const resetPercents = jest.fn();
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
  const marketAmount = 25;
  const quoteAssetAccuracy = 2;
  const handleButtonClick = jest.fn();
  const getConfirmButtonMessage = () => 'confirm message';
  const isButtonDisable = false;
  const isOrderInvalid = () => true;
  const baseAssetId = 'BTC';
  const quoteAssetId = 'USD';

  const getTestOrderMarket = () => {
    return (
      <OrderMarket
        onAmountArrowClick={onAmountArrowClick}
        resetPercents={resetPercents}
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
        marketAmount={marketAmount}
        quoteAssetAccuracy={quoteAssetAccuracy}
        handleButtonClick={handleButtonClick}
        getConfirmButtonMessage={getConfirmButtonMessage}
        isButtonDisable={isButtonDisable}
        isOrderInvalid={isOrderInvalid}
        isCurrentSideSell={true}
        baseAssetId={baseAssetId}
        quoteAssetId={quoteAssetId}
        // tslint:disable-next-line:jsx-no-lambda
        setMarketTotal={() => {
          return;
        }}
        isEnoughLiquidity={true}
      />
    );
  };

  it('should render 1 input control', () => {
    const wrapper = shallow(getTestOrderMarket());
    expect(wrapper.find('InputControl')).toHaveLength(1);
  });

  it('should contain input control with order title', () => {
    const inputControl = shallow(getTestOrderMarket())
      .find('InputControl')
      .first();
    expect(inputControl.find('OrderTitle')).toHaveLength(1);
    expect(inputControl.html()).toContain(`Amount (${baseAssetName})`);
  });

  it('should contain Available with balance info', () => {
    const wrapper = shallow(getTestOrderMarket());
    expect(wrapper.find('Available')).toHaveLength(1);
    expect(wrapper.find('Available').html()).toContain(
      `${formattedNumber(
        balance || 0,
        balanceAccuracy
      )} ${availableAssetName} available`
    );
  });

  it('should contain amount input', () => {
    const wrapper = shallow(getTestOrderMarket());
    expect(
      wrapper
        .find('NumberInput')
        .findWhere(n => n.props().id === OrderInputs.Amount)
    ).toHaveLength(1);
  });

  it('should contain Percentage component', () => {
    const wrapper = shallow(getTestOrderMarket());
    expect(wrapper.find('OrderPercentage')).toHaveLength(1);
  });

  describe('Percentage', () => {
    it('should contain percents prop', () => {
      const wrapper = shallow(getTestOrderMarket());
      const percentage = wrapper.find('OrderPercentage');
      expect((percentage.props() as any).percents).toBe(percents);
    });

    it('should contain isDisabled prop', () => {
      const wrapper = shallow(getTestOrderMarket());
      const percentage = wrapper.find('OrderPercentage');
      expect((percentage.props() as any).isDisabled).toBe(!balance);
    });
  });

  it('should contain OrderButton', () => {
    const wrapper = shallow(getTestOrderMarket());
    expect(wrapper.find('OrderButton')).toHaveLength(1);
  });

  describe('Order button', () => {
    it('should contain OrderConfirmButton', () => {
      const orderButton = shallow(getTestOrderMarket()).find('OrderButton');
      const orderConfirmButton = orderButton.find('OrderConfirmButton');
      expect(orderConfirmButton).toHaveLength(1);
    });

    it('should contain message prop', () => {
      const orderButton = shallow(getTestOrderMarket()).find('OrderButton');
      const orderConfirmButton = orderButton.find('OrderConfirmButton');
      expect((orderConfirmButton.props() as any).message).toBe(
        getConfirmButtonMessage()
      );
    });

    it('should contain isDisable prop', () => {
      const isConfirmButtonDisable = isButtonDisable || isOrderInvalid();
      const orderButton = shallow(getTestOrderMarket()).find('OrderButton');
      const orderConfirmButton = orderButton.find('OrderConfirmButton');
      expect((orderConfirmButton.props() as any).isDisable).toBe(
        isConfirmButtonDisable
      );
    });

    it('should contain type prop', () => {
      const orderButton = shallow(getTestOrderMarket()).find('OrderButton');
      const orderConfirmButton = orderButton.find('OrderConfirmButton');
      expect((orderConfirmButton.props() as any).type).toBe('button');
    });
  });

  describe('events', () => {
    describe('amount input', () => {
      const wrapper = mount(getTestOrderMarket());
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
        const wrapper = mount(getTestOrderMarket());
        const percent = wrapper
          .find('OrderPercentage')
          .find('Percent')
          .first();

        percent.simulate('click');
        expect(updatePercentState).toHaveBeenCalled();
      });

      it('should call updatePercentState after clicking available', () => {
        const wrapper = mount(getTestOrderMarket());
        const available = wrapper.find('Available');

        available.simulate('click');
        expect(updatePercentState).toHaveBeenCalled();
      });

      it('should not call updatePercentState', () => {
        jest.resetAllMocks();
        balance = 0;

        const wrapper = mount(getTestOrderMarket());
        const percent = wrapper
          .find('OrderPercentage')
          .find('Percent')
          .first();

        percent.simulate('click');
        expect(updatePercentState).not.toHaveBeenCalled();
      });
    });
  });
});
