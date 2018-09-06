import Side from '../models/side';
import RestApi from './restApi';
import {ApiResponse} from './types';

export interface CancelAllOrders {
  AssetPairId?: string;
}

export interface OrderApi {
  placeMarket: (body: OrderRequestBody) => ApiResponse;
  placeLimit: (body: OrderRequestBody) => ApiResponse;
  placeStopLimit: (body: StopLimitRequestBody) => ApiResponse;
  cancelOrder: (id: string) => ApiResponse;
  cancelAllOrders: (body: CancelAllOrders) => ApiResponse;
  fetchAll: () => ApiResponse;
}

export interface OrderRequestBody {
  AssetId: string;
  AssetPairId: string;
  OrderAction: Side;
  Volume: number;
  Price?: number;
}

export interface StopLimitRequestBody {
  AssetPairId: string;
  OrderAction: Side;
  Volume: number;
  LowerLimitPrice: number | null;
  LowerPrice: number | null;
  UpperLimitPrice: number | null;
  UpperPrice: number | null;
}

export type RequestBody = OrderRequestBody | StopLimitRequestBody;

export class RestOrderApi extends RestApi implements OrderApi {
  placeMarket = (body: OrderRequestBody) =>
    this.fireAndForget('/Orders/market', body);

  placeLimit = (body: OrderRequestBody) => this.post('/Orders/limit', body);

  placeStopLimit = (body: StopLimitRequestBody) =>
    this.post('/Orders/stoplimit', body);

  cancelOrder = (id: string) =>
    this.fireAndForget(`/orders/limit/${id}/cancel`, {});

  cancelAllOrders = (body: any) => this.deleteWithParams(`/orders/limit`, body);

  fetchAll = () => this.get('/orders');
}

export default OrderApi;
