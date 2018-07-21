import {AssetModel, InstrumentModel, OrderType, Side} from '../../models';
import {EditOrderStore, RootStore, UiOrderStore} from '../index';

describe('edit order store', () => {
  let editOrderStore: EditOrderStore;

  beforeEach(() => {
    editOrderStore = new EditOrderStore(new RootStore());
  });

  it('edit store should be instance of uiOrderStore', () => {
    expect(editOrderStore instanceof UiOrderStore).toBeTruthy();
  });

  it('price accuracy should be 2 by default', () => {
    expect(editOrderStore.getPriceAccuracy()).toBe(2);
  });

  it('quantity accuracy should be 2 by default', () => {
    expect(editOrderStore.getAmountAccuracy()).toBe(2);
  });

  it('should set custom price accuracy', () => {
    editOrderStore.setPriceAccuracy(3);
    expect(editOrderStore.getPriceAccuracy()).toBe(3);
  });

  it('should set custom price accuracy', () => {
    editOrderStore.setAmountAccuracy(3);
    expect(editOrderStore.getAmountAccuracy()).toBe(3);
  });

  it('should return confirm button message', () => {
    expect(editOrderStore.getConfirmButtonMessage()).toBe('Modify');
  });

  describe('request body', () => {
    const baseAssetName = 'BTC';
    const quoteAssetName = 'USD';
    const amountValue = '5';
    const priceValue = '10';

    beforeEach(() => {
      editOrderStore.rootStore.uiStore.selectedInstrument = new InstrumentModel(
        {
          baseAsset: new AssetModel({name: baseAssetName, id: baseAssetName}),
          id: `${baseAssetName}${quoteAssetName}`,
          quoteAsset: new AssetModel({name: quoteAssetName})
        }
      );
    });

    it('should return body for limit order', () => {
      editOrderStore.setMarket(OrderType.Limit);
      editOrderStore.setSide(Side.Buy);
      editOrderStore.setAmountValue(amountValue);
      editOrderStore.setPriceValue(priceValue);
      const requestBody = editOrderStore.getOrderRequestBody();
      expect(requestBody.AssetId).toBe(baseAssetName);
      expect(requestBody.AssetPairId).toBe(`${baseAssetName}${quoteAssetName}`);
      expect(requestBody.OrderAction).toBe(Side.Buy);
      expect(requestBody.Volume).toBe(parseFloat(amountValue));
      expect(requestBody.Price).toBe(parseFloat(priceValue));
    });
  });
});
