import {pathOr} from 'rambda';
import {connect} from '../connect';
import DepthChart from './DepthChart';

const formatWithAccuracy = (num: number, accuracy: number) =>
  num.toLocaleString(undefined, {
    maximumFractionDigits: accuracy
  });

const ConnectedDepthChart = connect(
  ({
    depthChartStore: {nextSpan, prevSpan, mid},
    orderBookStore: {setMidPriceUpdateHandler},
    uiStore: {selectedInstrument}
  }) => ({
    setMidPriceUpdateHandler,
    quoteAccuracy: pathOr(0, ['accuracy'], selectedInstrument),
    format: formatWithAccuracy,
    onNextSpan: nextSpan,
    onPrevSpan: prevSpan,
    mid
  }),
  DepthChart
);

export default ConnectedDepthChart;
export {default as DepthChart} from './DepthChart';
