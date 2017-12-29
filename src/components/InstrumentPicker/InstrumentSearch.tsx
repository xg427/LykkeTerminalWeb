import {rem} from 'polished';
import * as React from 'react';
import styled from '../styled';
import {InstrumentPickerActions} from './index';

interface InstrumentSearchProps extends InstrumentPickerActions {
  className?: string;
}

const InstrumentSearch: React.SFC<InstrumentSearchProps> = ({
  className,
  onSearch
}) => (
  <div className={className}>
    <input
      type="search"
      placeholder="Search instrument..."
      // tslint:disable-next-line:jsx-no-lambda
      onChange={e => onSearch && onSearch(e.currentTarget.value)}
    />
  </div>
);

const StyledInstrumentSearch = styled(InstrumentSearch)`
  padding: 0 ${rem(10)} ${rem(10)};
  & > input {
    background-color: rgb(51, 51, 51);
    border-radius: 4px;
    border: solid 2px #333;
    color: #fff;
    padding: ${rem(10)};
    width: 100%;
    &:active {
      border: solid 2px rgb(3, 136, 239);
    }
  }
`;

export default StyledInstrumentSearch;