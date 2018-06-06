import * as React from 'react';
import ReactDOM from 'react-dom';

import {colors} from '../styled';

import {InstrumentModel, Order, Side} from '../../models';
import {LEFT_PADDING, LEVELS_COUNT, TOP_PADDING} from './index';

import {curry, map, prop, toLower} from 'rambda';
import {normalizeVolume} from '../../utils';
import {
  defineCanvasScale,
  drawLine,
  drawRect,
  drawText,
  drawVerticalLine
} from '../../utils/canvasUtils';

import LevelType from '../../models/levelType';
import OrderBookCellType from '../../models/orderBookCellType';
import {FakeOrderBookStage} from './styles';

const getFont = (ratio: number) =>
  `${ratio === 1 ? 12.25 : 10 * ratio}px Proxima Nova`;

const fillBySide = (side: Side) =>
  side === Side.Buy ? colors.buy : colors.sell;

const getCellType = (type: string) =>
  type === OrderBookCellType.Depth
    ? OrderBookCellType.Depth
    : OrderBookCellType.Volume;

const getY = (side: Side, idx: number, levelHeight: number) =>
  (side === Side.Buy ? idx : LEVELS_COUNT - idx - 1) * levelHeight;

export interface LevelListProps {
  levels: Order[];
  instrument: InstrumentModel;
  format: (num: number, accuracy: number) => string;
  normalize: (num: number) => number;
  height: number;
  width: number;
  isReadOnly: boolean;
  getAsks: any;
  getBids: any;
  displayType: string;
  getLevels: () => Order[];
  setLevelsDrawingHandler: (
    fn: (asks: Order[], bids: Order[], type: LevelType) => void
  ) => void;
  triggerOrderUpdate: (clickedEl: any) => void;
  type: LevelType;
}

class LevelList extends React.Component<LevelListProps> {
  canvas: HTMLCanvasElement | null;
  canvasCtx: CanvasRenderingContext2D | null;
  levelsCells: any[] = [];
  levelsLength: number = 0;
  fakeStage: any;
  ratio: number = 1;
  memoWidth: number = 0;

  handleLevelsDrawing = (asks: Order[], bids: Order[], type: LevelType) => {
    window.requestAnimationFrame(() => {
      this.renderCanvas(asks, bids, type);
      this.forceUpdate();
    });
  };

  togglePointerEvents = (value: string) =>
    ((ReactDOM.findDOMNode(this.fakeStage) as HTMLDivElement).style[
      'pointer-events'
    ] = value);

  handleRatioChange = (ratio: number) => {
    this.ratio = ratio;
  };

  componentDidMount() {
    const {setLevelsDrawingHandler} = this.props;
    setLevelsDrawingHandler(this.handleLevelsDrawing);
    this.canvasCtx = this.canvas!.getContext('2d');
    this.canvas!.addEventListener(
      'mouseup',
      (event: any) => {
        const x = event.layerX * this.ratio;
        const y = event.layerY * this.ratio;

        const clickedLevelElement = this.levelsCells.find(
          (el: any) =>
            y > el.top &&
            y < el.top + el.height &&
            x > el.left &&
            x < el.left + el.width
        );

        if (clickedLevelElement) {
          this.props.triggerOrderUpdate(clickedLevelElement);
        }
        this.togglePointerEvents('auto');
      },
      false
    );

    defineCanvasScale(
      this.canvasCtx,
      this.canvas,
      this.props.width,
      this.props.height,
      this.handleRatioChange
    );
  }

  drawLevels = (asks: Order[] = [], bids: Order[] = [], type: LevelType) => {
    this.levelsCells = [];
    const {displayType, instrument, format, width} = this.props;

    const levels = type === LevelType.Asks ? asks : bids;
    this.levelsLength = levels.length;

    const levelHeight = this.canvas!.height / LEVELS_COUNT;
    const vals = map(prop(toLower(displayType)), [
      ...asks,
      ...bids
    ]) as number[];
    const normalize = curry(normalizeVolume)(
      Math.min(...vals),
      Math.max(...vals)
    );

    levels.forEach((l, i: number) => {
      const y = getY(l.side, i, levelHeight);
      const canvasY = getY(
        l.side,
        l.side === Side.Sell ? i - 1 : i + 1,
        levelHeight
      );
      const value = format(
        l[displayType] * l.price,
        instrument.quoteAsset.accuracy
      );
      const color = fillBySide(l.side);

      drawRect({
        ctx: this.canvasCtx,
        color,
        x: width / 3,
        y,
        width: normalize(l[displayType]),
        height: levelHeight,
        opacity: 0.16
      });

      if (l.connectedLimitOrders.length > 0) {
        drawVerticalLine({
          ctx: this.canvasCtx,
          x: width / 3 + 1,
          y: y + 2,
          height: y + levelHeight - 2,
          lineWidth: 2,
          color,
          lineCap: 'round'
        });
      }

      drawLine({
        ctx: this.canvasCtx,
        width,
        y: canvasY,
        x: LEFT_PADDING,
        color: colors.graphiteBorder,
        lineWidth: 1
      });

      drawText({
        ctx: this.canvasCtx,
        color,
        text: format(l.price, instrument.accuracy),
        x: LEFT_PADDING,
        y: canvasY - TOP_PADDING * this.ratio,
        font: getFont(this.ratio),
        align: 'start'
      });
      this.levelsCells.push({
        left: LEFT_PADDING,
        top: y,
        width: (width / 3 - LEFT_PADDING) * this.ratio,
        height: levelHeight,
        type: OrderBookCellType.Price,
        value: l.price,
        side: l.side
      });

      drawText({
        ctx: this.canvasCtx,
        color,
        text: format(l[displayType], instrument.baseAsset.accuracy),
        x: width / 3 + LEFT_PADDING,
        y: canvasY - TOP_PADDING * this.ratio,
        font: getFont(this.ratio),
        align: 'start'
      });
      this.levelsCells.push({
        left: width / 3,
        top: y,
        width: width / 3 * this.ratio,
        height: levelHeight,
        type: getCellType(displayType),
        value: l.depth,
        side: l.side
      });

      drawText({
        ctx: this.canvasCtx,
        color: colors.white,
        text: value,
        x: width,
        y: canvasY - TOP_PADDING * this.ratio,
        font: getFont(this.ratio),
        align: 'end'
      });
    });
  };

  componentWillReceiveProps({width}: any) {
    if (width !== this.memoWidth) {
      this.memoWidth = width;
      defineCanvasScale(
        this.canvasCtx,
        this.canvas,
        width,
        this.props.height,
        this.handleRatioChange
      );
    }
    window.requestAnimationFrame(() => {
      this.renderCanvas(
        this.props.getAsks(),
        this.props.getBids(),
        this.props.type
      );
      this.forceUpdate();
    });
  }

  renderCanvas = (asks: Order[], bids: Order[], type: LevelType) => {
    if (this.canvas) {
      this.canvas!.width = this.canvas!.width;
    }

    this.drawLevels(asks, bids, type);
  };

  render() {
    return (
      <React.Fragment>
        {!this.props.isReadOnly && (
          <FakeOrderBookStage
            width={this.props.width / 3 * 2}
            height={this.props.height}
            // tslint:disable-next-line:jsx-no-lambda
            onMouseDown={() => this.togglePointerEvents('none')}
            ref={(div: any) => (this.fakeStage = div)}
          />
        )}
        <canvas
          width={this.props.width}
          height={this.props.height}
          ref={(canvas: any) => (this.canvas = canvas)}
        />
      </React.Fragment>
    );
  }
}

export default LevelList;
