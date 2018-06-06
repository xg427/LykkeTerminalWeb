import {connect} from '../../connect';
import ChartWrapper from './ChartWrapper';

// tslint:disable:object-literal-sort-keys
const ConnectedChart = connect(
  ({
    depthChartStore: {getAsks, getBids, setSpanChangeHandler},
    uiStore: {selectedInstrument},
    orderBookStore: {setMidPriceUpdateHandler, setDepthChartUpdatingHandler}
  }) => {
    return {
      getAsks,
      getBids,
      selectedInstrument,
      setMidPriceUpdateHandler,
      setDepthChartUpdatingHandler,
      setSpanChangeHandler
    };
  },
  ChartWrapper
);

export default ConnectedChart;
export {default as ChartWrapper} from './ChartWrapper';
