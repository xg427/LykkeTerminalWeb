import {pathOr} from 'rambda';
import {connect} from '../connect';
import DepthChart from './DepthChart';

const formatWithAccuracy = (num: number, accuracy: number) =>
  num.toLocaleString(undefined, {
    maximumFractionDigits: accuracy
  });

const ConnectedDepthChart = connect(
  ({
    depthChartStore: {mid, nextSpan, prevSpan, isMaxZoom, isMinZoom},
    uiStore: {selectedInstrument},
    orderBookStore: {setMidPriceUpdateHandler, removeMidPriceUpdateHandler}
  }) => ({
    setMidPriceUpdateHandler,
    quoteAccuracy: pathOr(0, ['accuracy'], selectedInstrument),
    format: formatWithAccuracy,
    zoomIn: nextSpan,
    zoomOut: prevSpan,
    isMaxZoom,
    isMinZoom,
    mid,
    removeMidPriceUpdateHandler
  }),
  DepthChart
);

export default ConnectedDepthChart;
export {default as DepthChart} from './DepthChart';
