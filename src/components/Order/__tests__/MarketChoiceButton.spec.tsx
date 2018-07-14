import {shallow} from 'enzyme';
import * as React from 'react';

import {Side} from '../../../models';
import MarketChoiceButton from '../MarketChoiceButton';

describe('<MarketChoiceButton>', () => {
  const actionSide = Side.Buy;
  const handleClickFn = () => {
    return;
  };
  const isActionActive = true;

  const getTestMarketChoiceButton = (
    side: Side,
    handleClick: () => void,
    isActive: boolean
  ) => {
    return (
      <MarketChoiceButton
        title={side}
        click={handleClick}
        isActive={isActive}
      />
    );
  };

  it('should be rendered', () => {
    const wrapper = shallow(
      getTestMarketChoiceButton(actionSide, handleClickFn, isActionActive)
    );
    expect(wrapper.find('MarketButton')).toHaveLength(1);
  });

  describe('market property', () => {
    let marketProperty: any;

    beforeEach(() => {
      const wrapper = shallow(
        getTestMarketChoiceButton(actionSide, handleClickFn, isActionActive)
      );
      marketProperty = wrapper.find('MarketButton').find('MarketProperty');
    });

    it('should present', () => {
      expect(marketProperty).toHaveLength(1);
    });

    it('should contain text with side value', () => {
      expect(marketProperty.children().text()).toBe(actionSide);
    });

    it('should contain isActive props', () => {
      expect(marketProperty.props().isActive).toBe(isActionActive);
    });

    it('should handle click', () => {
      let oldValue = 'old value';
      const newValue = 'new value';
      const handleClick = () => (oldValue = newValue);
      const wrapper = shallow(
        getTestMarketChoiceButton(actionSide, handleClick, isActionActive)
      );
      marketProperty = wrapper.find('MarketButton').find('MarketProperty');
      marketProperty.simulate('click', {});
      expect(oldValue).toBe(newValue);
    });
  });
});
