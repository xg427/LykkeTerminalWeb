import {pathOr} from 'rambda';
import * as React from 'react';
import {InstrumentModel, TradeModel} from '../../models';
import {LoaderProps} from '../Loader/withLoader';
import {TableHeaderNoSort} from '../Table';
import {PublicTradeList} from './';

export interface TradeLogProps extends LoaderProps {
  selectedInstrument: InstrumentModel;
  trades: TradeModel[];
  getIsWampTradesProcessed: () => boolean;
  setIsWampTradesProcessed: (isProcessing: boolean) => void;
}

class TradeLog extends React.Component<TradeLogProps> {
  headers: any[] = [
    {
      key: 'price',
      value: `Price (${pathOr(
        '',
        ['quoteAsset', 'name'],
        this.props.selectedInstrument
      )})`
    },
    {
      className: 'right-align',
      key: 'volume',
      value: 'Trade size'
    },
    {
      className: 'right-align',
      key: 'timestamp',
      value: 'Time'
    }
  ];

  componentDidUpdate() {
    const {getIsWampTradesProcessed, setIsWampTradesProcessed} = this.props;
    if (getIsWampTradesProcessed()) {
      setIsWampTradesProcessed(false);
    }
  }

  render() {
    return (
      <React.Fragment>
        <TableHeaderNoSort headers={this.headers} />
        <PublicTradeList
          trades={this.props.trades}
          isProcessingWampTrades={this.props.getIsWampTradesProcessed()}
        />
      </React.Fragment>
    );
  }
}

export default TradeLog;
