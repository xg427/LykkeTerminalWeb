import OrderApi, {
  OrderRequestBody,
  RequestBody,
  StopLimitRequestBody
} from '../api/orderApi';
import * as topics from '../api/topics';
import messages from '../constants/notificationMessages';
import logger from '../Logger';
import {ApiError, levels, OrderStatus, OrderType} from '../models';
import {BaseStore, RootStore} from './index';
import NotificationStore from './notificationStore';

const errorOrNoop = (error: string) => {
  try {
    return JSON.parse(error);
  } catch {
    return undefined;
  }
};

// tslint:disable:no-console
class OrderStore extends BaseStore {
  private readonly notificationStore: NotificationStore;

  constructor(store: RootStore, private readonly api: OrderApi) {
    super(store);
    this.notificationStore = this.rootStore.notificationStore;
  }

  placeOrder = async (orderType: OrderType, body: RequestBody) => {
    switch (orderType) {
      case OrderType.Market:
        return this.api
          .placeMarket(body as OrderRequestBody)
          .then(this.orderPlacedSuccessfully, this.orderPlacedUnsuccessfully)
          .then(() => Promise.resolve());
      case OrderType.Limit:
        return this.api
          .placeLimit(body as OrderRequestBody)
          .then(
            (orderId: any) =>
              this.optimisticOrderAdding(orderId, body as OrderRequestBody),
            this.orderPlacedUnsuccessfully
          );
      case OrderType.StopLimit:
        return this.api
          .placeStopLimit(body as StopLimitRequestBody)
          .then(
            (orderId: string) =>
              this.optimisticStopLimitOrderAdding(
                orderId,
                body as StopLimitRequestBody
              ),
            this.orderPlacedUnsuccessfully
          );
    }
  };

  optimisticOrderAdding = (orderId: string, body: OrderRequestBody) => {
    const addedOrder = this.rootStore.orderListStore.addOrder({
      Id: orderId,
      CreateDateTime: new Date(),
      OrderAction: body.OrderAction,
      Volume: body.Volume,
      RemainingVolume: body.Volume,
      Price: body.Price,
      AssetPairId: body.AssetPairId,
      Type: OrderType.Limit
    });
    if (addedOrder) {
      this.orderPlacedSuccessfully();
    }
  };

  optimisticStopLimitOrderAdding = (
    orderId: string,
    body: StopLimitRequestBody
  ) => {
    const addedOrder = this.rootStore.orderListStore.addOrder({
      Id: orderId,
      CreateDateTime: new Date(),
      OrderAction: body.OrderAction,
      Volume: body.Volume,
      RemainingVolume: body.Volume,
      AssetPairId: body.AssetPairId,
      Type: OrderType.StopLimit,
      LowerPrice: body.LowerPrice,
      LowerLimitPrice: body.LowerLimitPrice,
      UpperPrice: body.UpperPrice,
      UpperLimitPrice: body.UpperLimitPrice
    });
    if (addedOrder) {
      this.orderPlacedSuccessfully();
    }
  };

  editOrder = async (body: RequestBody, id: string, orderType: OrderType) =>
    this.api
      .cancelOrder(id)
      .then(() => this.placeOrder(orderType, body))
      .catch(this.orderPlacedUnsuccessfully);

  cancelOrder = async (id: string) => {
    try {
      await this.api.cancelOrder(id);
      const deletedOrder = this.rootStore.orderListStore.deleteOrder(id);
      if (deletedOrder) {
        this.orderCancelledSuccessfully(id);
      }
    } catch (error) {
      this.orderPlacedUnsuccessfully(error);

      logger.logException(error);
    }
  };

  cancelAll = async (isCurrentAsset: boolean) => {
    try {
      const selectedInstrument = this.rootStore.uiStore.selectedInstrument;
      const body = isCurrentAsset ? {AssetPairId: selectedInstrument!.id} : {};

      await this.api.cancelAllOrders(body);
      this.rootStore.orderListStore.deleteAllOrders(body.AssetPairId);
      this.allOrdersCancelledSuccessfully(
        isCurrentAsset ? selectedInstrument!.displayName : null
      );
    } catch (error) {
      this.orderPlacedUnsuccessfully(error);

      logger.logException(error);
    }
  };

  subscribe = () => {
    this.rootStore.socketStore.subscribe(topics.orders, this.onOrders);
  };

  onOrders = (args: any) => {
    const order = args[0][0];
    switch (order.Status) {
      case OrderStatus.Cancelled:
        const deleteOrder = this.rootStore.orderListStore.deleteOrder(order.Id);
        if (deleteOrder) {
          this.orderCancelledSuccessfully(order.Id);
        }
        break;
      case OrderStatus.Matched:
        this.rootStore.orderListStore.deleteOrder(order.Id);
        this.orderClosedSuccessfully(order.Id);
        break;
      case OrderStatus.Processing:
        this.rootStore.orderListStore.addOrUpdateOrder(order);
        this.orderPartiallyClosedSuccessfully(order.Id, order.RemainingVolume);
        break;
      case OrderStatus.Placed:
        const isAdded = this.rootStore.orderListStore.addOrder(order);
        if (isAdded) {
          this.orderPlacedSuccessfully();
        }
        break;
    }
  };

  reset = () => {
    return;
  };

  private orderClosedSuccessfully = (orderId: string) => {
    this.notificationStore.addNotification(
      levels.success,
      messages.orderExecuted(orderId)
    );
  };

  private orderPartiallyClosedSuccessfully = (
    orderId: string,
    orderVolume: number
  ) => {
    this.notificationStore.addNotification(
      levels.success,
      messages.orderExecutedPartially(orderId, orderVolume)
    );
  };

  private orderPlacedSuccessfully = () => {
    this.notificationStore.addNotification(
      levels.success,
      messages.orderSuccess
    );
  };

  private orderCancelledSuccessfully = (orderId: string) => {
    this.notificationStore.addNotification(
      levels.information,
      `${messages.orderCancelled} ${orderId}`
    );
  };

  private allOrdersCancelledSuccessfully = (
    instrumentName: string | null | undefined
  ) => {
    this.notificationStore.addNotification(
      levels.information,
      `${
        instrumentName
          ? messages.allCurrentInstrumentOrdersCancelled(instrumentName)
          : messages.allOrdersCancelled
      }`
    );
  };

  private orderPlacedUnsuccessfully = (error: any) => {
    const errorObject = errorOrNoop(error.message);
    if (!errorObject) {
      if (error.message === 'Session confirmation is required') {
        this.rootStore.modalStore.setSessionConfirmationModalState(true);
      } else {
        this.notificationStore.addNotification(
          levels.error,
          `${error.message}`
        );
      }
    } else {
      const key = Object.keys(errorObject)[0];
      if (error.status === 400) {
        switch (key) {
          case ApiError.AssetKycNeeded:
            this.rootStore.modalStore.setMissedKycModalState(true);
            break;
          default:
            {
              const message = errorObject[key];
              this.notificationStore.addNotification(
                levels.error,
                `${message}`
              );
            }
            break;
        }
      } else {
        const message = errorObject[key];
        this.notificationStore.addNotification(levels.error, `${message}`);
      }
    }
  };
}

export default OrderStore;
