import {connect} from '../../connect';
import ChartWrapper from './ChartWrapper';

// tslint:disable:object-literal-sort-keys
const ConnectedChart = connect(
  ({
    depthChartStore: {getAsks, getBids, setSpanChangeHandler, mid},
    uiStore: {selectedInstrument},
    orderBookStore: {
      setMidPriceUpdateHandler,
      setDepthChartUpdatingHandler,
      handleDepthChartUnmount
    }
  }) => {
    return {
      getAsks,
      getBids,
      selectedInstrument,
      setMidPriceUpdateHandler,
      setDepthChartUpdatingHandler,
      setSpanChangeHandler,
      mid,
      handleDepthChartUnmount
    };
  },
  ChartWrapper
);

export default ConnectedChart;
export {default as ChartWrapper} from './ChartWrapper';
