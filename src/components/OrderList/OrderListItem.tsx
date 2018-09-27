import * as React from 'react';
import {AnalyticsEvents} from '../../constants/analyticsEvents';
import {InstrumentModel, OrderModel, OrderType, Side} from '../../models';
import {AnalyticsService} from '../../services/analyticsService';
import {formattedNumber} from '../../utils/localFormatted/localFormatted';
import {precisionCeil, precisionFloor} from '../../utils/math';
import {Icon} from '../Icon/index';
import {Cell} from '../Table/styles';
import TitledCell from '../Table/TitledCell';
import {OrderActions, OrderCellWidth} from './index';
import {SideCell} from './styles';

interface OrderListItemProps {
  onEdit: any;
  order: OrderModel;
  instrument: InstrumentModel;
  changeInstrumentById: (id: string) => void;
  isSelected: boolean;
}

const getSide = (order: OrderModel, accuracy: number) => {
  const {stopPrice, side, type} = order;
  return type === OrderType.Limit
    ? side
    : `Stop @ ${formattedNumber(stopPrice!, accuracy)}`;
};

const OrderListItem: React.SFC<OrderActions & OrderListItemProps> = ({
  order,
  onEdit,
  cancelOrder,
  instrument: {
    displayName,
    accuracy,
    baseAsset: {accuracy: baseAssetAccuracy, name: baseAssetName},
    quoteAsset: {accuracy: quoteAssetAccuracy, name: quoteAssetName},
    id: instrumentId
  },
  changeInstrumentById,
  isSelected
}) => {
  const handleEditOrder = () => {
    onEdit(order.id);
    AnalyticsService.track(AnalyticsEvents.StartOrderEdit);
  };
  const handleCancelOrder = () => {
    cancelOrder(order.id);
    AnalyticsService.track(AnalyticsEvents.CancelOrder);
  };
  const roundedValue =
    order.side === Side.Buy
      ? precisionCeil(order.value, quoteAssetAccuracy)
      : precisionFloor(order.value, quoteAssetAccuracy);
  const handleChangeInstrument = () =>
    !isSelected && changeInstrumentById(instrumentId);
  return (
    <tr>
      <Cell
        clickable={!isSelected}
        onClick={handleChangeInstrument}
        w={OrderCellWidth.Symbol}
      >
        {displayName}
      </Cell>
      <SideCell w={OrderCellWidth.Side} side={order.side}>
        {getSide(order, accuracy)}
      </SideCell>
      <TitledCell title={formattedNumber(order.price, accuracy)}>
        {formattedNumber(order.price, accuracy)}
      </TitledCell>
      <TitledCell>
        {formattedNumber(order.volume, baseAssetAccuracy)} {baseAssetName}
      </TitledCell>
      <TitledCell>
        {formattedNumber(order.filled, baseAssetAccuracy)} ({formattedNumber(
          order.filledPercent,
          0,
          {style: 'percent'}
        )})
      </TitledCell>
      <TitledCell>
        {formattedNumber(roundedValue, quoteAssetAccuracy)} {quoteAssetName}
      </TitledCell>
      <TitledCell>{order.createdAt.toLocaleString()}</TitledCell>
      <Cell w={OrderCellWidth.Actions}>
        <span onClick={handleEditOrder}>
          <Icon name={'edit-alt'} />
        </span>
        <span style={{marginLeft: '0.75rem'}} onClick={handleCancelOrder}>
          <Icon name={'close'} />
        </span>
      </Cell>
    </tr>
  );
};

export default OrderListItem;
