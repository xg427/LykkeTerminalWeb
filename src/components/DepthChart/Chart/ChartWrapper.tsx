import * as React from 'react';

import {observable} from 'mobx';

import {FastLayer, Layer, Stage} from 'react-konva';

import Measure from 'react-measure';

import Chart from './Chart';
import Mesh from './Mesh';

import {ChartProps} from './Models';

import chart from './chartConstants';

interface ChartState {
  mid: number;
}

class ChartWrapper extends React.Component<ChartProps, ChartState> {
  @observable width: number = -1;
  @observable height: number = -1;

  constructor(props: ChartProps) {
    super(props);
    this.state = {
      mid: 0
    };

    this.props.setMidPriceUpdateHandler(this.handleMidPriceChange);
  }

  handleMidPriceChange = async (mid: () => number) => {
    const midPrice = await mid();
    this.setState({
      mid: midPrice
    });
  };

  render() {
    const {asks, bids, selectedInstrument} = this.props;

    return (
      <Measure
        // tslint:disable-next-line:jsx-boolean-value
        client
        // tslint:disable-next-line:jsx-no-lambda
        onResize={contentRect => {
          this.width = Math.ceil(contentRect.client!.width);
          this.height = Math.ceil(contentRect.client!.height);
          this.forceUpdate();
        }}
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
                    mid={this.state.mid}
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
                    mid={this.state.mid}
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
