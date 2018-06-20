import {shallow} from 'enzyme';
import React from 'react';

import {Tab} from '..';

describe('<Tab>', () => {
  it('should render content inside tab', () => {
    const wrapper = shallow(<Tab title="Test">Test</Tab>);
    expect(wrapper.prop('title')).toBe('Test');
  });

  it('should render to static HTML', () => {
    const wrapper = shallow(<Tab title="Test">Test</Tab>);
    expect(wrapper.children().text()).toEqual('Test');
  });
});
