import {shallow} from 'enzyme';
import * as React from 'react';

import {Side} from '../../../models';
import ActionChoiceButton from '../ActionChoiceButton';

describe('<ActionChoiceButton>', () => {
  const actionSide = Side.Buy;
  const handleClickFn = () => {
    return;
  };
  const isActionActive = true;

  const getTestActionButtonChoice = (
    side: Side,
    handleClick: () => void,
    isActive: boolean
  ) => {
    return (
      <ActionChoiceButton
        title={side}
        click={handleClick}
        isActive={isActive}
      />
    );
  };

  it('should render ActionChoiceButton', () => {
    const wrapper = shallow(
      getTestActionButtonChoice(actionSide, handleClickFn, isActionActive)
    );
    expect(wrapper.find('ActionChoiceButton')).toHaveLength(1);
  });

  it('should contain side as a prop', () => {
    const wrapper = shallow(
      getTestActionButtonChoice(actionSide, handleClickFn, isActionActive)
    );
    const actionBtn = wrapper.find('ActionChoiceButton');
    expect((actionBtn.props() as any).side).toBe(actionSide);
  });

  describe('action property', () => {
    let actionProperty: any;

    beforeEach(() => {
      const wrapper = shallow(
        getTestActionButtonChoice(actionSide, handleClickFn, isActionActive)
      );
      actionProperty = wrapper
        .find('ActionChoiceButton')
        .find('ActionProperty');
    });
  });
});
