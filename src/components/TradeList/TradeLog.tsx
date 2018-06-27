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
  componentDidUpdate() {
    const {getIsWampTradesProcessed, setIsWampTradesProcessed} = this.props;
    if (getIsWampTradesProcessed()) {
      setIsWampTradesProcessed(false);
    }
  }

  render() {
    const headers: any[] = [
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

    return (
      <React.Fragment>
        <TableHeaderNoSort headers={headers} />
        <PublicTradeList
          trades={this.props.trades}
          isProcessingWampTrades={this.props.getIsWampTradesProcessed()}
        />
      </React.Fragment>
    );
  }
}

export default TradeLog;
