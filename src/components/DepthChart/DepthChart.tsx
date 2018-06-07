import * as React from 'react';
import {FAIcon} from '../Icon/Icon';
import {Figure, FigureHint, FigureValue} from '../OrderBook/styles';
import ChartWrapper from './Chart/index';
import {AbsoluteCentered, Bar, Button, FillHeight} from './styles';

interface DepthChartProps {
  setMidPriceUpdateHandler: (fn: (mid: () => number) => Promise<void>) => void;
  mid: () => Promise<number>;
  quoteAccuracy: number;
  format: (num: number, accuracy: number) => string;
  onNextSpan: () => void;
  onPrevSpan: () => void;
}

interface DepthChartState {
  mid: number;
}

class DepthChart extends React.Component<DepthChartProps, DepthChartState> {
  constructor(props: DepthChartProps) {
    super(props);
    this.state = {
      mid: 0
    };

    this.props.setMidPriceUpdateHandler(this.handleMidPriceChange);
  }

  componentDidMount() {
    this.props.mid().then((mid: number) => this.setState({mid}));
  }

  handleMidPriceChange = async (mid: () => number) => {
    const midPrice = await mid();
    this.setState({
      mid: midPrice
    });
  };

  render() {
    const {quoteAccuracy, format, onNextSpan, onPrevSpan} = this.props;
    return (
      <FillHeight>
        <AbsoluteCentered>
          <Bar>
            <Button onClick={onPrevSpan}>
              <FAIcon name="minus" />
            </Button>
            <Figure>
              <FigureValue>{format(this.state.mid, quoteAccuracy)}</FigureValue>
              <FigureHint>Mid price</FigureHint>
            </Figure>
            <Button onClick={onNextSpan}>
              <FAIcon name="plus" />
            </Button>
          </Bar>
        </AbsoluteCentered>
        <FillHeight>
          <ChartWrapper />
        </FillHeight>
      </FillHeight>
    );
  }
}

export default DepthChart;
