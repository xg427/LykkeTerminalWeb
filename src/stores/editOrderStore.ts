import {computed, observable} from 'mobx';
import {OrderType} from '../models';
import Side from '../models/side';
import {DEFAULT_INPUT_VALUE} from '../utils/inputNumber';
import {RootStore, UiOrderStore} from './index';

import {OrderRequestBody} from '../api/orderApi';

import {pathOr} from 'rambda';

class EditOrderStore extends UiOrderStore {
  @computed
  get isCurrentSideSell() {
    return this.side === Side.Sell;
  }

  @computed
  get marketAmount() {
    const price =
      (this.side === Side.Sell
        ? this.rootStore.orderBookStore.bestBidPrice
        : this.rootStore.orderBookStore.bestAskPrice) || 0;

    return price * +this.amountValue;
  }

  @computed
  get limitAmount() {
    return +this.priceValue * +this.amountValue;
  }

  @computed
  get stopLimitAmount() {
    return this.side === Side.Sell
      ? +this.priceValue * +this.amountValue
      : +this.amountValue / +this.priceValue;
  }

  @observable stopPriceValue: string = DEFAULT_INPUT_VALUE;
  @observable priceValue: string = DEFAULT_INPUT_VALUE;
  @observable amountValue: string = DEFAULT_INPUT_VALUE;
  @observable market: OrderType = OrderType.Limit;
  @observable side: Side = Side.Sell;
  priceAccuracy: number = 2;
  amountAccuracy: number = 2;

  constructor(store: RootStore) {
    super(store);
  }

  getConfirmButtonMessage = () => {
    return 'Modify';
  };

  getLimitRequestBody = (): OrderRequestBody => {
    const baseAssetId = pathOr(
      '',
      ['baseAsset', 'id'],
      this.rootStore.uiStore.selectedInstrument
    );
    const assetPairId = pathOr(
      '',
      ['id'],
      this.rootStore.uiStore.selectedInstrument
    );
    return {
      AssetId: baseAssetId,
      AssetPairId: assetPairId,
      OrderAction: this.side,
      Volume: parseFloat(this.amountValue),
      Price: parseFloat(this.priceValue)
    };
  };

  // tslint:disable-next-line:no-empty
  reset = () => {};
}

export default EditOrderStore;
