import {Order, Side} from '../..';
import {getMaxAvailableVolume, toOrder} from '../orderMapper';

describe('orderMapper', () => {
  describe('method toOrder', () => {
    it('should return mapped object', () => {
      const rawObject = {
        Id: '1',
        Price: 1000,
        DateTime: Date.now(),
        Volume: 1
      };
      const mappedObjectWithDefaultSide = toOrder(rawObject);
      expect(mappedObjectWithDefaultSide.id).toEqual(rawObject.Id);
      expect(mappedObjectWithDefaultSide.price).toEqual(rawObject.Price);
      expect(mappedObjectWithDefaultSide.timestamp).toEqual(rawObject.DateTime);
      expect(mappedObjectWithDefaultSide.volume).toEqual(rawObject.Volume);
      expect(mappedObjectWithDefaultSide.depth).toEqual(0);
      expect(mappedObjectWithDefaultSide.side).toEqual(Side.Buy);
      expect(mappedObjectWithDefaultSide.orderVolume).toEqual(0);
      expect(mappedObjectWithDefaultSide.connectedLimitOrders).toBeInstanceOf(
        Array
      );
      expect(mappedObjectWithDefaultSide.connectedLimitOrders).toHaveLength(0);

      const mappedObjectWithSide = toOrder(rawObject, Side.Sell);
      expect(mappedObjectWithSide.side).toEqual(Side.Sell);
    });
  });

  describe('method getMaxAvailableVolume', () => {
    it('should return 0 is no orders available', () => {
      const maxVolume = getMaxAvailableVolume(10000, []);
      expect(maxVolume).toBe(0);
    });

    it('should return max available volume for passed price with test orders', () => {
      const orders = [
        Order.create({price: 8000, volume: 0.5}),
        Order.create({price: 10000, volume: 1}),
        Order.create({price: 12000, volume: 0.5})
      ];

      let maxVolume = getMaxAvailableVolume(4000, orders);
      expect(maxVolume).toBe(0.25);

      maxVolume = getMaxAvailableVolume(10000, orders);
      expect(maxVolume).toBe(1.1);

      maxVolume = getMaxAvailableVolume(30000, orders);
      expect(maxVolume).toBe(2);
    });

    it('should return max available volume for passed price with real orders', () => {
      const orders = [
        Order.create({price: 6044.23, volume: 0.05}),
        Order.create({price: 6045.985, volume: 0.125}),
        Order.create({price: 6047.25, volume: 0.2}),
        Order.create({price: 6048.293, volume: 0.275}),
        Order.create({price: 6049.201, volume: 0.35}),
        Order.create({price: 6054.945, volume: 0.00000166}),
        Order.create({price: 6109.89, volume: 1.00016354}),
        Order.create({price: 6217.642, volume: 0.01}),
        Order.create({price: 8000, volume: 0.17706688}),
        Order.create({price: 9000, volume: 5.09697945})
      ];

      const convertVolumeToString = (volume: number) => volume.toFixed(8);

      let maxVolume = getMaxAvailableVolume(98828.14, orders);
      expect(convertVolumeToString(maxVolume)).toBe('7.28421153');

      maxVolume = getMaxAvailableVolume(2500, orders);
      expect(convertVolumeToString(maxVolume)).toBe('0.38557527');

      maxVolume = getMaxAvailableVolume(1000, orders);
      expect(convertVolumeToString(maxVolume)).toBe('0.06442669');

      maxVolume = getMaxAvailableVolume(200, orders);
      expect(convertVolumeToString(maxVolume)).toBe('0.00165447');

      maxVolume = getMaxAvailableVolume(10, orders);
      expect(convertVolumeToString(maxVolume)).toBe('0.00008272');
    });
  });
});
