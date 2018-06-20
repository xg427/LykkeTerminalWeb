import {
  Dropdown,
  DropdownContainer,
  DropdownList,
  DropdownListItem
} from 'lykke-react-components';
import {rem} from 'polished';
import {withStyledScroll} from '../CustomScrollbar';
import styled, {colors, fonts} from '../styled';

const DROPDOWN_WIDTH = 175;

export const StyledDropdown = styled(Dropdown)`
  width: ${DROPDOWN_WIDTH}px;
`;

export const StyledDropdownControlParent = styled.div`
  float: right;
  padding-top: 3px;
`;

export const StyledDropdownControlButton = styled.div`
  position: relative;
  width: ${DROPDOWN_WIDTH}px;
  min-height: calc(20px + ${rem(20)});
  padding: ${rem(10)};
  margin: 1px;
  border: 1px solid ${colors.greyBorder};
  font-size: ${rem(fonts.normal)};
  color: ${colors.white};

  &:first-letter {
    text-transform: capitalize;
  }

  &:hover {
    cursor: pointer;
  }

  svg {
    float: right;
  }
`;

export const StyledDropdownContainer = styled(DropdownContainer)`
  &.dropdown__container {
    margin-left: -88px;
    padding-top: 0;
    transform: none !important;
    transition: none !important;

    &:hover {
      transform: none !important;
      transition: none !important;
    }
  }

  .dropdown__nav {
    background-color: ${colors.grey};
    height: 310px;
    padding: 0;
    margin-top: 0;
    border-radius: 0;

    > div {
      border: none !important;
    }

    li.dropdown-list__item {
      border: 1px solid ${colors.greyBorder};
      border-bottom: 0;
      line-height: normal;
      color: ${colors.whiteText};
      border-radius: 0;

      &:hover {
        background-color: ${colors.grey};
        cursor: pointer;
      }

      &.isActive {
        background-color: ${colors.blue};

        &:hover {
          background-color: ${colors.blue};
        }
      }
    }
  }
`;

export const StyledDropdownList = withStyledScroll({
  height: '100%',
  border: `1px solid ${colors.greyBorder}`
})(styled(DropdownList)`
  background-color: ${colors.grey};
`);

export const StyledDropdownListItem = styled(DropdownListItem)`
  background-color: ${colors.grey};
  padding: ${rem(10)};
`;
