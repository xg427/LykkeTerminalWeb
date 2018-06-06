import {connect} from '../../connect';
import ChartWrapper from './ChartWrapper';

// tslint:disable:object-literal-sort-keys
const ConnectedChart = connect(
  ({
    depthChartStore: {asks, bids},
    uiStore: {selectedInstrument},
    orderBookStore: {setMidPriceUpdateHandler}
  }) => {
    return {
      asks,
      bids,
      selectedInstrument,
      setMidPriceUpdateHandler
    };
  },
  ChartWrapper
);

export default ConnectedChart;
export {default as ChartWrapper} from './ChartWrapper';
