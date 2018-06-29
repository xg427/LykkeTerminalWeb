import {Order, Side} from '..';

export const toOrder = (dto: any, side: Side = Side.Buy) =>
  Order.create({
    id: dto.Id,
    price: dto.Price,
    timestamp: dto.DateTime,
    volume: dto.Volume,
    depth: 0,
    side,
    orderVolume: 0,
    connectedLimitOrders: []
  });

const getValueForAvailableVolume = (order: Order) => order.price * order.volume;

const getAvailableVolume = (amount: number, order: Order) =>
  amount * order.volume / order.price;

export const getMaxAvailableVolume = (amount: number, orders: Order[]) => {
  let expendedPrice: number = 0;

  return orders.reduce((maxVolume, order) => {
    if (expendedPrice >= amount) {
      return maxVolume;
    }

    const amountLeft = amount - expendedPrice;
    const valueForAvailableVolume = getValueForAvailableVolume(order);
    const isValueAvailable = valueForAvailableVolume < amountLeft;
    if (isValueAvailable) {
      expendedPrice += valueForAvailableVolume;
      return maxVolume + order.volume;
    }

    expendedPrice = amount;
    return maxVolume + getAvailableVolume(amountLeft, order);
  }, 0);
};
