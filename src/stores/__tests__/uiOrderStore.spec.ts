import {OrderRequestBody, StopLimitRequestBody} from '../../api/orderApi';
import {ArrowDirection, OrderType, Side} from '../../models';
import {pathOr} from 'rambda';
import {
  ArrowDirection,
  AssetModel,
  InstrumentModel,
  OrderType,
  Side
} from '../../models';
import {ArrowDirection, Order, OrderType, Side} from '../../models';
import {DEFAULT_INPUT_VALUE} from '../../utils/inputNumber';
import formattedNumber from '../../utils/localFormatted/localFormatted';
import {getPercentsOf, precisionFloor} from '../../utils/math';
import {RootStore, UiOrderStore} from '../index';

describe('uiOrder store', () => {
  let uiOrderStore: UiOrderStore;

  beforeEach(() => {
    uiOrderStore = new UiOrderStore(new RootStore());
  });

  describe('values validation', () => {
    const mainAssetBalance = 2;

    it('price accuracy should be 2 by default', () => {
      expect(uiOrderStore.getPriceAccuracy()).toBe(2);
    });

    it('quantity accuracy should be 2 by default', () => {
      expect(uiOrderStore.getAmountAccuracy()).toBe(2);
    });

    it('should set custom price accuracy', () => {
      uiOrderStore.setPriceAccuracy(3);
      expect(uiOrderStore.getPriceAccuracy()).toBe(3);
    });

    it('should set custom price accuracy', () => {
      uiOrderStore.setAmountAccuracy(3);
      expect(uiOrderStore.getAmountAccuracy()).toBe(3);
    });

    it('should change price', () => {
      expect(uiOrderStore.priceValue).toBe(DEFAULT_INPUT_VALUE);
      uiOrderStore.handlePriceChange('1');
      expect(uiOrderStore.priceValue).toBe('1');
    });

    it('should change quantity', () => {
      expect(uiOrderStore.amountValue).toBe(DEFAULT_INPUT_VALUE);
      uiOrderStore.handleAmountChange('1');
      expect(uiOrderStore.amountValue).toBe('1');
    });

    it('should change stop price', () => {
      expect(uiOrderStore.stopPriceValue).toBe(DEFAULT_INPUT_VALUE);
      uiOrderStore.handleStopPriceChange('1');
      expect(uiOrderStore.stopPriceValue).toBe('1');
    });

    it('should increase price by 1 digit', () => {
      const price = '0.02';
      uiOrderStore.handlePriceChange(price);
      expect(uiOrderStore.priceValue).toBe(price);
      uiOrderStore.handlePriceArrowClick(ArrowDirection.Up);
      expect(uiOrderStore.priceValue).toBe('0.03');
    });

    it('should decrease price by 1 digit', () => {
      const price = '0.02';
      uiOrderStore.handlePriceChange(price);
      expect(uiOrderStore.priceValue).toBe(price);
      uiOrderStore.handlePriceArrowClick(ArrowDirection.Down);
      expect(uiOrderStore.priceValue).toBe('0.01');
    });

    it('should increase stop price by 1 digit', () => {
      const price = '0.02';
      uiOrderStore.handleStopPriceChange(price);
      expect(uiOrderStore.stopPriceValue).toBe(price);
      uiOrderStore.handleStopPriceArrowClick(ArrowDirection.Up);
      expect(uiOrderStore.stopPriceValue).toBe('0.03');
    });

    it('should decrease stop price by 1 digit', () => {
      const price = '0.02';
      uiOrderStore.handleStopPriceChange(price);
      expect(uiOrderStore.stopPriceValue).toBe(price);
      uiOrderStore.handleStopPriceArrowClick(ArrowDirection.Down);
      expect(uiOrderStore.stopPriceValue).toBe('0.01');
    });

    it('should increase quantity by 1 digit', () => {
      const quantity = '0.02';
      uiOrderStore.handleAmountChange(quantity);
      expect(uiOrderStore.amountValue).toBe(quantity);
      uiOrderStore.handleAmountArrowClick(ArrowDirection.Up);
      expect(uiOrderStore.amountValue).toBe('0.03');
    });

    it('should decrease quantity by 1 digit', () => {
      const quantity = '0.02';
      uiOrderStore.handleAmountChange(quantity);
      expect(uiOrderStore.amountValue).toBe(quantity);
      uiOrderStore.handleAmountArrowClick(ArrowDirection.Down);
      expect(uiOrderStore.amountValue).toBe('0.01');
    });

    it('should set price with fixing', () => {
      const price = 1;
      expect(uiOrderStore.priceValue).toBe(DEFAULT_INPUT_VALUE);
      uiOrderStore.setPriceValueWithFixed(price);
      expect(uiOrderStore.priceValue).toBe(
        price.toFixed(uiOrderStore.getPriceAccuracy())
      );
    });

    it('should set stop price with fixing', () => {
      const price = 1;
      expect(uiOrderStore.stopPriceValue).toBe(DEFAULT_INPUT_VALUE);
      uiOrderStore.setStopPriceValueWithFixed(price);
      expect(uiOrderStore.stopPriceValue).toBe(
        price.toFixed(uiOrderStore.getPriceAccuracy())
      );
    });

    it('should set quantity with fixing', () => {
      const quantity = 1;
      expect(uiOrderStore.priceValue).toBe(DEFAULT_INPUT_VALUE);
      uiOrderStore.setPriceValueWithFixed(quantity);
      expect(uiOrderStore.priceValue).toBe(
        quantity.toFixed(uiOrderStore.getAmountAccuracy())
      );
    });

    it('should set price', () => {
      const price = '1';
      expect(uiOrderStore.priceValue).toBe(DEFAULT_INPUT_VALUE);
      uiOrderStore.setPriceValue(price);
      expect(uiOrderStore.priceValue).toBe(price);
    });

    it('should set amount', () => {
      const amount = '1';
      expect(uiOrderStore.amountValue).toBe(DEFAULT_INPUT_VALUE);
      uiOrderStore.setAmountValue(amount);
      expect(uiOrderStore.amountValue).toBe(amount);
    });

    it('should set stop price', () => {
      const stopPrice = '1';
      expect(uiOrderStore.stopPriceValue).toBe(DEFAULT_INPUT_VALUE);
      uiOrderStore.setStopPriceValue(stopPrice);
      expect(uiOrderStore.stopPriceValue).toBe(stopPrice);
    });

    it('should return current price', () => {
      expect(uiOrderStore.priceValue).toBe(uiOrderStore.getPriceValue());
    });

    it('should return current amount', () => {
      expect(uiOrderStore.amountValue).toBe(uiOrderStore.getAmountValue());
    });

    it('should return current stop price', () => {
      expect(uiOrderStore.stopPriceValue).toBe(
        uiOrderStore.getStopPriceValue()
      );
    });

    it('should set a limit type for order by default', () => {
      expect(uiOrderStore.market).toBe(OrderType.Limit);
    });

    it('should change order type', () => {
      expect(uiOrderStore.market).toBe(OrderType.Limit);
      uiOrderStore.setMarket(OrderType.Market);
      expect(uiOrderStore.market).toBe(OrderType.Market);
      uiOrderStore.setMarket(OrderType.StopLimit);
      expect(uiOrderStore.market).toBe(OrderType.StopLimit);
    });

    it('should set buy side by default', () => {
      expect(uiOrderStore.isCurrentSideSell).toBeFalsy();
    });

    it('should change order side', () => {
      expect(uiOrderStore.isCurrentSideSell).toBeFalsy();
      uiOrderStore.setSide(Side.Sell);
      expect(uiOrderStore.isCurrentSideSell).toBeTruthy();
    });

    it('should change stop price value', () => {
      const stopPrice = '123';
      uiOrderStore.setStopPriceValue(stopPrice);
      expect(uiOrderStore.stopPriceValue).toBe(stopPrice);
    });

    it('should change price, reset volume, set order type to limit and change the side if market is not limit', () => {
      expect(uiOrderStore.isCurrentSideSell).toBeFalsy();
      expect(uiOrderStore.priceValue).toBe(DEFAULT_INPUT_VALUE);
      uiOrderStore.setMarket(OrderType.Market);
      uiOrderStore.setAmountValue('123');
      expect(uiOrderStore.market).toBe(OrderType.Market);

      const newPrice = 1;

      uiOrderStore.handlePriceClickFromOrderBook(newPrice, Side.Sell);
      expect(uiOrderStore.isCurrentSideSell).toBeTruthy();
      expect(uiOrderStore.priceValue).toBe(
        newPrice.toFixed(uiOrderStore.getPriceAccuracy())
      );
      expect(uiOrderStore.amountValue).toBe(DEFAULT_INPUT_VALUE);
      expect(uiOrderStore.market).toBe(OrderType.Limit);
    });

    it('should change price and change the side if market is limit', () => {
      expect(uiOrderStore.isCurrentSideSell).toBeFalsy();
      expect(uiOrderStore.priceValue).toBe(DEFAULT_INPUT_VALUE);

      const newPrice = 1;

      uiOrderStore.handlePriceClickFromOrderBook(newPrice, Side.Sell);
      expect(uiOrderStore.isCurrentSideSell).toBeTruthy();
      expect(uiOrderStore.priceValue).toBe(
        newPrice.toFixed(uiOrderStore.getPriceAccuracy())
      );
    });

    it('should change volume, set order type to market, change the order side', () => {
      expect(uiOrderStore.isCurrentSideSell).toBeFalsy();
      expect(uiOrderStore.amountValue).toBe(DEFAULT_INPUT_VALUE);
      expect(uiOrderStore.market).toBe(OrderType.Limit);

      const newQuantity = 1;

      uiOrderStore.handleVolumeClickFromOrderBook(newQuantity, Side.Sell);
      expect(uiOrderStore.isCurrentSideSell).toBeTruthy();
      expect(uiOrderStore.amountValue).toBe(
        newQuantity.toFixed(uiOrderStore.getAmountAccuracy())
      );
      expect(uiOrderStore.market).toBe(OrderType.Market);
    });

    it('should return calculated percent value of balance for limit and sell side', () => {
      const balance = 100;
      const percents = 30;
      uiOrderStore.handleLimitPercentageChange(balance, percents);
      expect(uiOrderStore.amountValue).toBe(
        uiOrderStore
          .onPercentChangeForLimit(percents, balance, Side.Sell)
          .toFixed(uiOrderStore.getAmountAccuracy())
      );
    });

    it('should return calculated percent value of balance for limit and sell side', () => {
      const balance = 100;
      const percents = 30;
      uiOrderStore.handleStopLimitPercentageChange(balance, percents);
      expect(uiOrderStore.amountValue).toBe(
        uiOrderStore
          .onPercentChangeForLimit(percents, balance, Side.Sell)
          .toFixed(uiOrderStore.getAmountAccuracy())
      );
    });

    it('should return calculated percent value of balance for limit and buy side', () => {
      const balance = 52284.65;
      const percents = 50;
      uiOrderStore.setSide(Side.Buy);
      uiOrderStore.setPriceValue('1000');
      uiOrderStore.handleLimitPercentageChange(balance, percents);
      expect(uiOrderStore.amountValue).toBe(
        uiOrderStore
          .onPercentChangeForLimit(percents, balance, Side.Buy)
          .toFixed(uiOrderStore.getAmountAccuracy())
      );
    });

    it('should return calculated percent value of balance for market and sell side', () => {
      const balance = 100;
      const percents = 30;
      uiOrderStore.setSide(Side.Sell);
      uiOrderStore.setMarket(OrderType.Market);
      uiOrderStore.handleMarketPercentageChange(
        balance,
        'BTC',
        'USD',
        percents
      );
      expect(uiOrderStore.amountValue).toBe(
        getPercentsOf(
          percents,
          balance,
          uiOrderStore.getAmountAccuracy()
        ).toFixed(uiOrderStore.getAmountAccuracy())
      );
    });

    it('should return calculated percent value of balance for market and buy side', () => {
      const convertedBalance = 5.228465;
      const balance = 52284.65;
      const percents = 50;
      uiOrderStore.rootStore.orderBookStore.rawAsks = [
        Order.create({price: 10000, volume: 1000})
      ];
      uiOrderStore.setSide(Side.Buy);
      uiOrderStore.setMarket(OrderType.Market);
      uiOrderStore.handleMarketPercentageChange(
        balance,
        'BTC',
        'USD',
        percents
      );
      expect(uiOrderStore.amountValue).toBe(
        getPercentsOf(
          percents,
          convertedBalance,
          uiOrderStore.getAmountAccuracy()
        ).toFixed(uiOrderStore.getAmountAccuracy())
      );
    });

    it('should reset price and quantity', async () => {
      const midPrice = 1256.58;
      uiOrderStore.rootStore.orderBookStore.mid = () =>
        Promise.resolve(midPrice);

      uiOrderStore.setAmountValue('123');
      uiOrderStore.setPriceValue('123');
      expect(uiOrderStore.amountValue).not.toBe('0.00');
      expect(uiOrderStore.priceValue).not.toBe(
        midPrice.toFixed(uiOrderStore.getPriceAccuracy())
      );

      await uiOrderStore.resetOrder();
      expect(uiOrderStore.amountValue).toBe(DEFAULT_INPUT_VALUE);
      expect(uiOrderStore.priceValue).toBe(
        midPrice.toFixed(uiOrderStore.getPriceAccuracy())
      );
    });

    describe('stop limit validation', () => {
      const quoteAssetAccuracy = 2;

      it('should return false if stop limit order is valid', () => {
        uiOrderStore.setSide(Side.Sell);
        uiOrderStore.setStopPriceValue('2');
        uiOrderStore.setPriceValue('2');
        uiOrderStore.setAmountValue('2');
        uiOrderStore.rootStore.orderBookStore.bestBidPrice = 3;
        expect(
          uiOrderStore.isStopLimitInvalid(100, quoteAssetAccuracy)
        ).toBeFalsy();
      });

      it('should return true if stop price is valid for buy side', () => {
        uiOrderStore.setSide(Side.Buy);
        uiOrderStore.setStopPriceValue('2');
        uiOrderStore.setPriceValue('3');
        uiOrderStore.rootStore.orderBookStore.bestAskPrice = 1;
        expect(uiOrderStore.isStopPriceValid()).toBeTruthy();
      });

      it('should return true if stop price is valid for sell side', () => {
        uiOrderStore.setSide(Side.Sell);
        uiOrderStore.setStopPriceValue('2');
        uiOrderStore.setPriceValue('2');
        uiOrderStore.rootStore.orderBookStore.bestBidPrice = 3;
        expect(uiOrderStore.isStopPriceValid()).toBeTruthy();
      });

      it('should return true for valid floored stop price amount value', () => {
        uiOrderStore.setSide(Side.Sell);
        uiOrderStore.setAmountValue('1');
        uiOrderStore.setPriceValue('1');
        expect(
          uiOrderStore.isFlooredStopLimitAmountValid(quoteAssetAccuracy)
        ).toBeTruthy();

        uiOrderStore.setSide(Side.Buy);
        expect(
          uiOrderStore.isFlooredStopLimitAmountValid(quoteAssetAccuracy)
        ).toBeTruthy();
      });

      it('should return false for invalid floored stop price amount value', () => {
        uiOrderStore.setSide(Side.Sell);
        uiOrderStore.setAmountValue('0');
        uiOrderStore.setPriceValue('1');
        expect(
          uiOrderStore.isFlooredStopLimitAmountValid(quoteAssetAccuracy)
        ).toBeFalsy();

        uiOrderStore.setSide(Side.Buy);
        expect(
          uiOrderStore.isFlooredStopLimitAmountValid(quoteAssetAccuracy)
        ).toBeFalsy();
      });

      it('should return false if stop price is invalid for sell side', () => {
        uiOrderStore.setSide(Side.Sell);
        uiOrderStore.setStopPriceValue('2');
        uiOrderStore.rootStore.orderBookStore.bestBidPrice = 1;
        expect(uiOrderStore.isStopPriceValid()).toBeFalsy();

        uiOrderStore.setStopPriceValue('0');
        uiOrderStore.setPriceValue('2');
        expect(uiOrderStore.isStopPriceValid()).toBeFalsy();
      });

      it('should return false if stop price is invalid for buy side', () => {
        uiOrderStore.setSide(Side.Buy);
        uiOrderStore.setStopPriceValue('0');
        uiOrderStore.setPriceValue('2');
        uiOrderStore.rootStore.orderBookStore.bestAskPrice = 1;
        expect(uiOrderStore.isStopPriceValid()).toBeFalsy();

        uiOrderStore.setStopPriceValue('3');
        expect(uiOrderStore.isStopPriceValid()).toBeFalsy();
      });

      describe('invalid', () => {
        it('stop price is invalid', () => {
          uiOrderStore.setSide(Side.Sell);
          uiOrderStore.setStopPriceValue('0');
          uiOrderStore.setPriceValue('2');
          uiOrderStore.setAmountValue('2');
          expect(
            uiOrderStore.isStopLimitInvalid(100, quoteAssetAccuracy)
          ).toBeTruthy();
        });

        it('price is invalid', () => {
          uiOrderStore.setSide(Side.Sell);
          uiOrderStore.setStopPriceValue('2');
          uiOrderStore.setPriceValue('0');
          uiOrderStore.setAmountValue('2');
          expect(
            uiOrderStore.isStopLimitInvalid(100, quoteAssetAccuracy)
          ).toBeTruthy();
        });

        it('amount is invalid', () => {
          uiOrderStore.setSide(Side.Sell);
          uiOrderStore.setStopPriceValue('2');
          uiOrderStore.setPriceValue('2');
          uiOrderStore.setAmountValue('0');
          expect(
            uiOrderStore.isStopLimitInvalid(100, quoteAssetAccuracy)
          ).toBeTruthy();
        });

        it('amount is greater than base asset balance', () => {
          uiOrderStore.setSide(Side.Sell);
          uiOrderStore.setStopPriceValue('2');
          uiOrderStore.setPriceValue('2');
          uiOrderStore.setAmountValue('220');
          expect(
            uiOrderStore.isStopLimitInvalid(100, quoteAssetAccuracy)
          ).toBeTruthy();
        });

        it('limit total amount is greater than base asset balance', () => {
          uiOrderStore.setSide(Side.Buy);
          uiOrderStore.setStopPriceValue('2');
          uiOrderStore.setPriceValue('2');
          uiOrderStore.setAmountValue('220');
          expect(
            uiOrderStore.isStopLimitInvalid(100, quoteAssetAccuracy)
          ).toBeTruthy();
        });
      });
    });

    describe('market order validation', () => {
      const baseAssetId = 'BTC';
      const quoteAssetId = 'USD';
      const quoteAssetAccuracy = 2;

      it('should return true if amount value has default value', () => {
        expect(uiOrderStore.amountValue).toBe(DEFAULT_INPUT_VALUE);
        expect(
          uiOrderStore.isMarketInvalid(
            mainAssetBalance,
            baseAssetId,
            quoteAssetId,
            quoteAssetAccuracy
          )
        ).toBeTruthy();
      });

      it('should return true if amount is greater than baseAssetBalance for sell side', () => {
        const amount = '4';
        uiOrderStore.setAmountValue(amount);
        expect(parseFloat(uiOrderStore.amountValue)).toBeGreaterThan(
          mainAssetBalance
        );
        expect(
          uiOrderStore.isMarketInvalid(
            mainAssetBalance,
            baseAssetId,
            quoteAssetId,
            quoteAssetAccuracy
          )
        ).toBeTruthy();
      });

      it('should return true if quantity is greater than converted balance for buy side', () => {
        const convertedBalance = 5263.98;
        uiOrderStore.rootStore.marketStore.convert = () => convertedBalance;
        const quantity = '6258.368';
        uiOrderStore.setAmountValue(quantity);
        uiOrderStore.setSide(Side.Buy);
        expect(parseFloat(uiOrderStore.amountValue)).toBeGreaterThan(
          precisionFloor(+convertedBalance, uiOrderStore.getAmountAccuracy())
        );
        expect(
          uiOrderStore.isMarketInvalid(
            mainAssetBalance,
            baseAssetId,
            quoteAssetId,
            quoteAssetAccuracy
          )
        ).toBeTruthy();
      });

      it('should return true for valid floored market value', () => {
        uiOrderStore.setSide(Side.Sell);
        uiOrderStore.rootStore.orderBookStore.bestBidPrice = 1;
        uiOrderStore.setAmountValue('1');
        expect(
          uiOrderStore.isFlooredMarketAmountValid(quoteAssetAccuracy)
        ).toBeTruthy();
      });

      it('should return false for valid floored market value', () => {
        uiOrderStore.setAmountValue('0');
        expect(
          uiOrderStore.isFlooredMarketAmountValid(quoteAssetAccuracy)
        ).toBeFalsy();
      });
    });

    describe('limit order validation', () => {
      const quoteAssetAccuracy = 2;

      it('should return true if quantity value is equal 0', () => {
        const isInvalid = uiOrderStore.isLimitInvalid(
          mainAssetBalance,
          quoteAssetAccuracy
        );
        expect(isInvalid).toBeTruthy();
      });

      it('should return true if price value is equal 0', () => {
        const isInvalid = uiOrderStore.isLimitInvalid(
          mainAssetBalance,
          quoteAssetAccuracy
        );
        expect(isInvalid).toBeTruthy();
      });

      it('should return true for valid floored limit amount value', () => {
        uiOrderStore.setPriceValue('2');
        uiOrderStore.setAmountValue('1');
        expect(
          uiOrderStore.isFlooredLimitAmountValid(quoteAssetAccuracy)
        ).toBeTruthy();
      });

      it('should return false for valid floored limit amount value', () => {
        uiOrderStore.setPriceValue('2');
        uiOrderStore.setAmountValue('0');
        expect(
          uiOrderStore.isFlooredLimitAmountValid(quoteAssetAccuracy)
        ).toBeFalsy();
      });
    });

    describe('messages', () => {
      it('should return message for confirm button', () => {
        const baseAssetName = 'BTC';

        const amountValue = '5.568';
        const amountAccuracy = 3;
        const amount = formattedNumber(+amountValue, amountAccuracy);
        uiOrderStore.setSide(Side.Sell);
        uiOrderStore.setAmountValue(amountValue);
        uiOrderStore.setAmountAccuracy(amountAccuracy);
        expect(uiOrderStore.getConfirmButtonMessage(baseAssetName)).toBe(
          `${Side.Sell} ${amount} BTC`
        );
      });

      it('should return confirmation message', () => {
        const baseAssetName = 'BTC';
        const quoteAssetName = 'USD';

        uiOrderStore.setMarket(OrderType.Market);
        const amountValue = '5.568';
        const amountAccuracy = 3;
        const amount = formattedNumber(+amountValue, amountAccuracy);
        const priceValue = '5.568';
        const priceAccuracy = 3;
        const price = formattedNumber(+amountValue, amountAccuracy);

        uiOrderStore.setAmountValue(amountValue);
        uiOrderStore.setAmountAccuracy(amountAccuracy);
        uiOrderStore.setPriceValue(priceValue);
        uiOrderStore.setPriceAccuracy(priceAccuracy);

        let messageSuffix = 'at the market price';

        expect(
          uiOrderStore.getConfirmationMessage(baseAssetName, quoteAssetName)
        ).toBe(`${Side.Sell.toLowerCase()} ${amount} BTC ${messageSuffix}`);

        messageSuffix = `at the price of ${price} USD`;
        uiOrderStore.setMarket(OrderType.Limit);
        expect(
          uiOrderStore.getConfirmationMessage(baseAssetName, quoteAssetName)
        ).toBe(`${Side.Sell.toLowerCase()} ${amount} BTC ${messageSuffix}`);
      });
    });

    describe('request body', () => {
      const baseAssetName = 'BTC';
      const quoteAssetName = 'USD';
      const assetPairId = `${baseAssetName}${quoteAssetName}`;
      const amountValue = '5';
      const priceValue = '10';

      it('should return body for market order', () => {
        uiOrderStore.setMarket(OrderType.Market);
        uiOrderStore.setSide(Side.Sell);
        uiOrderStore.setAmountValue(amountValue);
        const requestBody = uiOrderStore.getOrderRequestBody(
          baseAssetName,
          assetPairId
        ) as OrderRequestBody;
        expect(requestBody.AssetId).toBe(baseAssetName);
        expect(requestBody.AssetPairId).toBe(
          `${baseAssetName}${quoteAssetName}`
        );
        expect(requestBody.OrderAction).toBe(Side.Sell);
        expect(requestBody.Volume).toBe(parseFloat(amountValue));
      });

      it('should return body for limit order', () => {
        uiOrderStore.setMarket(OrderType.Limit);
        uiOrderStore.setSide(Side.Buy);
        uiOrderStore.setAmountValue(amountValue);
        uiOrderStore.setPriceValue(priceValue);
        const requestBody = uiOrderStore.getOrderRequestBody(
          baseAssetName,
          assetPairId
        ) as OrderRequestBody;
        expect(requestBody.AssetId).toBe(baseAssetName);
        expect(requestBody.AssetPairId).toBe(
          `${baseAssetName}${quoteAssetName}`
        );
        expect(requestBody.OrderAction).toBe(Side.Buy);
        expect(requestBody.Volume).toBe(parseFloat(amountValue));
        expect(requestBody.Price).toBe(parseFloat(priceValue));
      });

      describe('stop limit', () => {
        const stopPrice = '100';

        it('should return price body for sell direction', () => {
          uiOrderStore.setMarket(OrderType.StopLimit);
          uiOrderStore.setSide(Side.Sell);
          uiOrderStore.setPriceValue(priceValue);
          uiOrderStore.setStopPriceValue(stopPrice);

          const priceBody = uiOrderStore.getPriceBodyForStopLimitOrder();
          expect(priceBody.UpperLimitPrice).toBeNull();
          expect(priceBody.UpperPrice).toBeNull();
          expect(priceBody.LowerLimitPrice).toBe(parseFloat(stopPrice));
          expect(priceBody.LowerPrice).toBe(parseFloat(priceValue));
        });

        it('should return price body for buy direction', () => {
          uiOrderStore.setMarket(OrderType.StopLimit);
          uiOrderStore.setSide(Side.Buy);
          uiOrderStore.setPriceValue(priceValue);
          uiOrderStore.setStopPriceValue(stopPrice);

          const priceBody = uiOrderStore.getPriceBodyForStopLimitOrder();
          expect(priceBody.UpperLimitPrice).toBe(parseFloat(stopPrice));
          expect(priceBody.UpperPrice).toBe(parseFloat(priceValue));
          expect(priceBody.LowerLimitPrice).toBeNull();
          expect(priceBody.LowerPrice).toBeNull();
        });

        it('should return body for stop limit request', () => {
          uiOrderStore.setMarket(OrderType.StopLimit);
          uiOrderStore.setSide(Side.Buy);
          uiOrderStore.setAmountValue(amountValue);
          uiOrderStore.setPriceValue(priceValue);
          uiOrderStore.setStopPriceValue(stopPrice);

          const requestBody = uiOrderStore.getOrderRequestBody(
            baseAssetName,
            assetPairId
          ) as StopLimitRequestBody;
          expect(requestBody.AssetPairId).toBe(
            `${baseAssetName}${quoteAssetName}`
          );
          expect(requestBody.OrderAction).toBe(Side.Buy);
          expect(requestBody.Volume).toBe(parseFloat(amountValue));
          expect(requestBody.UpperLimitPrice).toBe(parseFloat(stopPrice));
          expect(requestBody.UpperPrice).toBe(parseFloat(priceValue));
          expect(requestBody.LowerLimitPrice).toBeNull();
          expect(requestBody.LowerPrice).toBeNull();
        });
      });
    });
  });

  describe('market total', () => {
    const defaultMarketTotal = {
      canBeUpdated: true,
      operationType: '',
      operationVolume: 0,
      price: 0
    };
    const orders: Order[] = [
      {
        connectedLimitOrders: [''],
        depth: 0.00016667,
        id: '970fcdd7-8483-4096-a1b3-69f0a7c23dc6',
        orderVolume: 0,
        price: 6148.874,
        side: Side.Buy,
        timestamp: undefined,
        volume: 1.2
      },
      {
        connectedLimitOrders: [''],
        depth: 0.00137778,
        id: 'ac983f4e-024a-40ab-bc29-319715ba8a7b',
        orderVolume: 0,
        price: 6143.658,
        side: Side.Buy,
        timestamp: undefined,
        volume: 0.5
      }
    ].map((a: Partial<Order>) => Order.create(a));

    beforeEach(() => {
      uiOrderStore.resetMarketTotal();
    });

    it('should not block market total price for manual update', () => {
      const volume = 1;
      const type = Side.Sell;

      uiOrderStore.setMarketTotal();
      uiOrderStore.setMarketTotal(volume, type);

      expect(uiOrderStore.marketTotal.operationVolume).toBe(volume);
      expect(uiOrderStore.marketTotal.operationType).toBe(type);
    });

    it('should block market total price when debounce parameter injected', () => {
      const volume = 1;
      const type = Side.Sell;

      uiOrderStore.setMarketTotal(volume, type, true);

      const nextVolume = 2;
      uiOrderStore.setMarketTotal(nextVolume, type, true);

      expect(uiOrderStore.marketTotal.canBeUpdated).toBeFalsy();
      expect(uiOrderStore.marketTotal.operationVolume).toBe(volume);
    });

    it('should reset market total parameters', () => {
      const volume = 1;
      const type = Side.Sell;

      uiOrderStore.rootStore.orderBookStore.getBids = jest.fn(() => orders);
      uiOrderStore.setMarketTotal(volume, type);

      expect(uiOrderStore.marketTotal.operationVolume).toBe(volume);
      expect(uiOrderStore.marketTotal.operationType).toBe(type);
      expect(uiOrderStore.marketTotal.price).not.toBe(0);

      uiOrderStore.resetMarketTotal();
      expect(uiOrderStore.marketTotal.canBeUpdated).toBe(
        defaultMarketTotal.canBeUpdated
      );
      expect(uiOrderStore.marketTotal.operationType).toBe(
        defaultMarketTotal.operationType
      );
      expect(uiOrderStore.marketTotal.operationVolume).toBe(
        defaultMarketTotal.operationVolume
      );
      expect(uiOrderStore.marketTotal.price).toBe(defaultMarketTotal.price);
    });
  });
});
