import {observable} from 'mobx';
import {OrderType} from '../models';
import Side from '../models/side';
import {DEFAULT_INPUT_VALUE} from '../utils/inputNumber';
import {RootStore, UiOrderStore} from './index';

class EditOrderStore extends UiOrderStore {
  @observable stopPriceValue: string = DEFAULT_INPUT_VALUE;
  @observable priceValue: string = DEFAULT_INPUT_VALUE;
  @observable amountValue: string = DEFAULT_INPUT_VALUE;
  @observable market: OrderType = OrderType.Limit;
  @observable side: Side = Side.Sell;
  priceAccuracy: number = 2;

  constructor(store: RootStore) {
    super(store);
  }

  getConfirmButtonMessage = () => {
    return 'Modify';
  };

  // tslint:disable-next-line:no-empty
  reset = () => {};
}

export default EditOrderStore;
