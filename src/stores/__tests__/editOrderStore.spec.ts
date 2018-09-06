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
});
