import {computed, extendObservable} from 'mobx';
import {Side} from './index';
import {OrderType} from './orderType';

export interface IRestOrderModel {
  Id: string;
  CreateDateTime: number;
  Volume: number;
  Voume: number;
  RemainingVolume: number;
  Price: number;
  AssetPairId: string;
  OrderAction: Side;
  Type: OrderType;
  LowerPrice: number | null;
  LowerLimitPrice: number | null;
  UpperPrice: number | null;
  UpperLimitPrice: number | null;
}

class OrderModel {
  symbol: string;
  side: Side;
  volume: number;
  remainingVolume: number;
  price: number;
  createdAt: Date;
  id: string;
  cancelOrder?: (id: string) => void;
  type: OrderType = OrderType.Limit;
  stopPrice?: number;

  @computed
  get filled() {
    return this.volume - this.remainingVolume;
  }

  @computed
  get filledPercent() {
    return this.filled !== 0 ? this.filled / this.volume : 0;
  }

  @computed
  get value() {
    return this.price * this.volume;
  }

  constructor(order: Partial<OrderModel>) {
    extendObservable(this, order);
  }
}

export default OrderModel;
