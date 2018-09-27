import {shallow} from 'enzyme';
import * as React from 'react';

import {keys} from '../../../constants/keyBoardKeys';
import {ArrowDirection} from '../../../models';
import NumberInput, {DEFAULT_PLACEHOLDER} from '../NumberInput';

describe('<NumberInput>', () => {
  const id = ArrowDirection.Up;
  const value = '';
  const handleChange = () => () => {
    return;
  };
  const handleArrowClick = () => () => {
    return;
  };

  const getTestNumberInput = (
    propsId: ArrowDirection,
    propsValue: string,
    onChange: () => (e: any) => any,
    onArrowClick: (arrowDirection: ArrowDirection) => () => any
  ) => {
    return (
      <NumberInput
        id={propsId}
        value={propsValue}
        onChange={onChange}
        onArrowClick={onArrowClick}
      />
    );
  };

  it('should render number input', () => {
    const wrapper = shallow(
      getTestNumberInput(id, value, handleChange, handleArrowClick)
    );
    expect(wrapper.find('StyledInputNumberComponent')).toHaveLength(1);
  });

  it('should have placeholder with 0.00 value', () => {
    const wrapper = shallow(
      getTestNumberInput(id, value, handleChange, handleArrowClick)
    );
    const input = wrapper.find('StyledInput');
    expect(input.props().placeholder).toBe(DEFAULT_PLACEHOLDER);
  });

  it('should set id prop', () => {
    const wrapper = shallow(
      getTestNumberInput(id, value, handleChange, handleArrowClick)
    );
    const input = wrapper.find('StyledInput');
    expect(input.props().id).toBe(id);
  });

  it('should set value prop', () => {
    const wrapper = shallow(
      getTestNumberInput(id, value, handleChange, handleArrowClick)
    );
    const input = wrapper.find('StyledInput');
    expect(input.props().value).toBe(value);
  });

  describe('handle events', () => {
    it('should handle onChange event', () => {
      let testValue = 'old value';
      const handleChangeEvent = () => (e: any) => (testValue = e.target.value);

      const event = {
        target: {
          name: 'input',
          value: 'new value'
        }
      };

      const wrapper = shallow(
        getTestNumberInput(id, value, handleChangeEvent, handleArrowClick)
      );
      const input = wrapper.find('StyledInput');
      input.simulate('change', event);
      expect(testValue).toBe(event.target.value);
    });

    it('should handle keyboard event', () => {
      let arrowDirection = '';

      const handleArrowClickEvent = (ad: ArrowDirection) => () => {
        arrowDirection = ad;
      };

      const event = {
        keyCode: keys.down,
        preventDefault: () => {
          return;
        }
      };

      const wrapper = shallow(
        getTestNumberInput(id, value, handleChange, handleArrowClickEvent)
      );
      const input = wrapper.find('StyledInput');
      input.simulate('keyDown', event);
      expect(arrowDirection).toBe(ArrowDirection.Down);
    });
  });
});
