import {observable} from 'mobx';
import * as React from 'react';
import {FastLayer, Layer, Stage} from 'react-konva';
import Measure from 'react-measure';
import {Order} from '../../../models/order';
import Chart from './Chart';
import chart from './chartConstants';
import Mesh from './Mesh';
import {ChartProps} from './Models';

interface ChartWrapperProps extends ChartProps {
  setDepthChartUpdatingHandler: (fn: () => void) => void;
  setSpanChangeHandler: (fn: () => void) => void;
  getAsks: () => Promise<Order[]>;
  getBids: () => Promise<Order[]>;
  mid: () => Promise<number>;
  handleDepthChartUnmount: () => void;
}

interface ChartWrapperState {
  mid: number;
  bids: Order[];
  asks: Order[];
}

class ChartWrapper extends React.Component<
  ChartWrapperProps,
  ChartWrapperState
> {
  @observable width: number = -1;
  @observable height: number = -1;
  private isUnMount: boolean;

  constructor(props: ChartWrapperProps) {
    super(props);
    this.state = {
      mid: 0,
      bids: [],
      asks: []
    };

    this.props.setMidPriceUpdateHandler(
      'chartWrapper',
      this.handleMidPriceChange
    );
    this.props.setDepthChartUpdatingHandler(this.handleDepthChartUpdates);
    this.props.setSpanChangeHandler(this.handleDepthChartUpdates);
  }

  componentDidMount() {
    this.isUnMount = false;
    this.loadChartData().then(({mid, asks, bids}: any) => {
      this.setState({mid, asks, bids});
    });
  }

  componentWillUnmount() {
    this.isUnMount = true;
    this.props.handleDepthChartUnmount();
  }

  loadChartData = async () => {
    const mid = await this.props.mid();
    const asks = await this.props.getAsks();
    const bids = await this.props.getBids();
    return {mid, asks, bids};
  };

  handleDepthChartUpdates = async () => {
    const bids = await this.props.getBids();
    const asks = await this.props.getAsks();
    if (this.isUnMount) {
      return;
    }
    this.setState({bids, asks});
  };

  handleMidPriceChange = async (mid: () => number) => {
    const midPrice = await mid();
    if (this.isUnMount) {
      return;
    }
    this.setState({
      mid: midPrice
    });
  };

  handleResize = (contentRect: any) => {
    this.width = Math.ceil(contentRect.client!.width);
    this.height = Math.ceil(contentRect.client!.height);
    this.forceUpdate();
  };

  render() {
    const {selectedInstrument} = this.props;
    const {asks, bids, mid} = this.state;

    return (
      <Measure
        // tslint:disable-next-line:jsx-boolean-value
        client
        onResize={this.handleResize}
      >
        {({measureRef}) => (
          <div style={{height: '100%'}} ref={measureRef}>
            <Stage width={this.width} height={this.height}>
              <FastLayer clearBeforeDraw={true}>
                {selectedInstrument && (
                  <Mesh
                    key={1}
                    asks={asks}
                    bids={bids}
                    mid={mid}
                    baseAsset={selectedInstrument!.baseAsset.name}
                    quoteAsset={selectedInstrument!.quoteAsset.name}
                    width={this.width - chart.labelsWidth}
                    height={this.height - chart.labelsHeight}
                    quoteAccuracy={selectedInstrument!.quoteAsset.accuracy}
                    baseAccuracy={selectedInstrument!.baseAsset.accuracy}
                    priceAccuracy={selectedInstrument!.accuracy}
                  />
                )}
              </FastLayer>
              <Layer>
                {selectedInstrument && (
                  <Chart
                    asks={asks}
                    bids={bids}
                    mid={mid}
                    baseAsset={selectedInstrument!.baseAsset.name}
                    quoteAsset={selectedInstrument!.quoteAsset.name}
                    width={this.width - chart.labelsWidth}
                    height={this.height - chart.labelsHeight}
                    priceAccuracy={selectedInstrument!.accuracy}
                    quoteAccuracy={selectedInstrument!.quoteAsset.accuracy}
                    baseAccuracy={selectedInstrument!.baseAsset.accuracy}
                  />
                )}
              </Layer>
            </Stage>
          </div>
        )}
      </Measure>
    );
  }
}

export default ChartWrapper;
