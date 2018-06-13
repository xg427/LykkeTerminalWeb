import {connect} from '../../connect';
import ChartWrapper from './ChartWrapper';

// tslint:disable:object-literal-sort-keys
const ConnectedChart = connect(
  ({
    depthChartStore: {getAsks, getBids, setSpanChangeHandler, mid},
    uiStore: {selectedInstrument},
    orderBookStore: {
      setDepthChartUpdatingHandler,
      handleDepthChartUnmount,
      midPrice
    }
  }) => {
    return {
      getAsks,
      getBids,
      selectedInstrument,
      setDepthChartUpdatingHandler,
      setSpanChangeHandler,
      mid: midPrice,
      handleDepthChartUnmount
    };
  },
  ChartWrapper
);

export default ConnectedChart;
export {default as ChartWrapper} from './ChartWrapper';
