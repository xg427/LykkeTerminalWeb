import {mount} from 'enzyme';
import React from 'react';

import {ChoosableItemProps} from '../../ChoosableItem/ChoosableItem';
import SessionDurationSelection from '../SessionDurationSelection';

describe('<SessionDurationSelection>', () => {
  const handleSetDuration = jest.fn();
  const sessionCurrentDuration = 0.5;

  const getTestSessionDurationSelection = () => {
    return (
      <SessionDurationSelection
        handleSetDuration={handleSetDuration}
        sessionCurrentDuration={sessionCurrentDuration}
      />
    );
  };

  it('should render content', () => {
    const wrapper = mount(getTestSessionDurationSelection());
    expect(wrapper.find('Flex')).toHaveLength(1);
  });

  it('should render all available options', () => {
    const wrapper = mount(getTestSessionDurationSelection());
    expect(wrapper.find('ChoosableItem')).toHaveLength(5);
  });

  it('should mark default session duration as active', () => {
    const wrapper = mount(getTestSessionDurationSelection());
    const options = wrapper.find('ChoosableItem');
    const defaultOption = options.first();
    expect(
      (defaultOption.props() as Partial<ChoosableItemProps>).isActive
    ).toBeTruthy();
  });

  it('should call set action when user click on first option', () => {
    const wrapper = mount(getTestSessionDurationSelection());
    const options = wrapper.find('ChoosableItem');
    options.first().simulate('click');
    expect(handleSetDuration).toHaveBeenCalledWith(0.5);
  });
});
