import {shallow} from 'enzyme';
import * as React from 'react';
import OrderPercentage from '../OrderPercentage';

describe('OrderPercentage', () => {
  const onClick = jest.fn();
  const isDisabled = false;
  const percents = [
    {
      isActive: true,
      percent: 25
    },
    {
      isActive: false,
      percent: 50
    }
  ];

  const getTestOrderPercentage = () => {
    return (
      <OrderPercentage
        onClick={onClick}
        isDisabled={isDisabled}
        percents={percents}
      />
    );
  };

  it('should render styled percents', () => {
    const wrapper = shallow(getTestOrderPercentage());
    expect(wrapper.find('StyledPercent')).toHaveLength(percents.length);
  });

  it('should call onClick prop', () => {
    const wrapper = shallow(getTestOrderPercentage());
    const styledPercent = wrapper.find('StyledPercent').first();
    styledPercent.simulate('click');
    expect(onClick).toHaveBeenCalledWith(0);
  });

  it('should present styled percent with prop className is active', () => {
    const wrapper = shallow(getTestOrderPercentage());
    const styledPercent = wrapper.findWhere(
      n => n.prop('className') === 'active'
    );
    expect(styledPercent).toHaveLength(1);
  });

  it('should present styled percent with prop className is empty', () => {
    const wrapper = shallow(getTestOrderPercentage());
    const styledPercent = wrapper.findWhere(n => n.prop('className') === '');
    expect(styledPercent).toHaveLength(1);
  });

  it('should contain disabled prop', () => {
    const wrapper = shallow(getTestOrderPercentage());
    const styledPercent = wrapper.find('StyledPercent').first();
    expect(styledPercent.props().disabled).toBe(isDisabled);
  });
});
