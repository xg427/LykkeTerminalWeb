import {mount} from 'enzyme';
import React from 'react';
import {OrderType, Side} from '../../../models';
import Order from '../Order';

const mockOrderBlock = `<div
        percents={''}
        updatePercentState={''}
        resetPercents={''}
        handleButtonClick={''}
        isButtonDisable={''}
      />`;

jest.mock('../index', () => ({
  OrderMarket: () => mockOrderBlock,
  OrderLimit: () => mockOrderBlock,
  StopLimitOrder: () => mockOrderBlock
}));

describe('<Order>', () => {
  let placeOrder: any;
  let setMarket: (value: OrderType) => void;
  let setSide: (side: Side) => void;
  let currentMarket: OrderType;
  let isCurrentSideSell: boolean;
  let resetOrder: () => void;
  let isDisclaimerShown: boolean;
  let disclaimedAssets: string[];
  let getConfirmationMessage: () => string;
  let getOrderRequestBody: () => any;

  const getTestOrder = () => (
    <Order
      placeOrder={placeOrder}
      setMarket={setMarket}
      setSide={setSide}
      currentMarket={currentMarket}
      isCurrentSideSell={isCurrentSideSell}
      resetOrder={resetOrder}
      isDisclaimerShown={isDisclaimerShown}
      disclaimedAssets={disclaimedAssets}
      getConfirmationMessage={getConfirmationMessage}
      getOrderRequestBody={getOrderRequestBody}
    />
  );

  beforeEach(() => {
    placeOrder = jest.fn();
    setMarket = jest.fn();
    setSide = jest.fn();
    currentMarket = OrderType.Market;
    isCurrentSideSell = false;
    resetOrder = jest.fn();
    isDisclaimerShown = false;
    disclaimedAssets = [];
    getConfirmationMessage = jest.fn();
    getOrderRequestBody = jest.fn();
  });

  describe('method render', () => {
    it('should render Buy and Sell option buttons', () => {
      const wrapper = mount(getTestOrder());
      expect(wrapper.find('ActionChoiceButton')).toHaveLength(2);
    });

    it('should render Buy and Sell option buttons in correct order', () => {
      const wrapper = mount(getTestOrder());
      const buttons = wrapper.find('ActionChoiceButton');
      const sellButtonProps = buttons.at(0).props() as any;
      const buyButtonProps = buttons.at(1).props() as any;
      expect(sellButtonProps.title).toBe('Sell');
      expect(buyButtonProps.title).toBe('Buy');
    });

    it('should render market option buttons in correct order', () => {
      const wrapper = mount(getTestOrder());
      const buttons = wrapper.find('MarketChoiceButton');
      const limitMarket = buttons.at(0).props() as any;
      const marketMarket = buttons.at(1).props() as any;
      const stopLimitMarket = buttons.at(2).props() as any;
      expect(limitMarket.title).toBe(OrderType.Limit);
      expect(marketMarket.title).toBe(OrderType.Market);
      expect(stopLimitMarket.title).toBe(OrderType.StopLimit);
    });

    it('should render OrderMarket by default', () => {
      const wrapper = mount(getTestOrder());
      const orderMarket = wrapper.find('OrderMarket');
      expect(orderMarket).toHaveLength(1);
    });

    it('should render OrderLimit', () => {
      currentMarket = OrderType.Limit;
      const wrapper = mount(getTestOrder());
      const orderMarket = wrapper.find('OrderLimit');
      expect(orderMarket).toHaveLength(1);
    });

    it('should render StopLimitOrder', () => {
      currentMarket = OrderType.StopLimit;
      const wrapper = mount(getTestOrder());
      const orderMarket = wrapper.find('StopLimitOrder');
      expect(orderMarket).toHaveLength(1);
    });

    it('should render Reset component', () => {
      const wrapper = mount(getTestOrder());
      const reset = wrapper.find('Reset');
      expect(reset).toHaveLength(1);
    });

    it('should not render WithModal by default', () => {
      const wrapper = mount(getTestOrder());
      const confirmModal = wrapper.find('WithModal');
      expect(confirmModal).toHaveLength(0);
    });

    it('should render WithModal', () => {
      const wrapper = mount(getTestOrder());
      wrapper.setState({
        isConfirmModalOpen: true
      });
      const confirmModal = wrapper.find('WithModal');
      expect(confirmModal).toHaveLength(1);
    });

    it('should not render Disclaimer', () => {
      const wrapper = mount(getTestOrder());
      const disclaimer = wrapper.find('DisclaimerNotification');
      expect(disclaimer).toHaveLength(0);
    });

    it('should render Disclaimer', () => {
      isDisclaimerShown = true;
      disclaimedAssets = ['EOS'];
      const wrapper = mount(getTestOrder());
      const disclaimer = wrapper.find('DisclaimerNotification');
      expect(disclaimer).toHaveLength(1);
    });

    describe('handlers', () => {
      beforeEach(() => {
        jest.resetAllMocks();
      });

      it('should call resetOrder', () => {
        const wrapper = mount(getTestOrder());
        const resetBtn = wrapper.find('Reset').find('span');
        resetBtn.simulate('click');
        expect(resetOrder).toHaveBeenCalled();
      });

      it('should call setMarket with clicked market', () => {
        const wrapper = mount(getTestOrder());
        const buttons = wrapper.find('MarketChoiceButton');
        const limitMarket = buttons.at(0).find('MarketProperty');
        limitMarket.simulate('click');
        expect(setMarket).toHaveBeenCalledWith(OrderType.Limit);

        const marketMarket = buttons.at(1).find('MarketProperty');
        marketMarket.simulate('click');
        expect(setMarket).toHaveBeenCalledWith(OrderType.Market);

        const stopLimitMarket = buttons.at(2).find('MarketProperty');
        stopLimitMarket.simulate('click');
        expect(setMarket).toHaveBeenCalledWith(OrderType.StopLimit);
      });

      it('should call setSide with clicked side', () => {
        const wrapper = mount(getTestOrder());
        const buttons = wrapper.find('ActionChoiceButton');
        const sellButton = buttons.at(0).find('ActionProperty');
        sellButton.simulate('click');
        expect(setSide).toHaveBeenCalledWith(Side.Sell);

        const buyButton = buttons.at(1).find('ActionProperty');
        buyButton.simulate('click');
        expect(setSide).toHaveBeenCalledWith(Side.Buy);
      });
    });
  });
});
