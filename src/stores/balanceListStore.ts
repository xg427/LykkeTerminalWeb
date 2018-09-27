import {action, computed, runInAction} from 'mobx';
import {add, pathOr} from 'rambda';
import {BalanceListApi} from '../api/index';
import * as topics from '../api/topics';
import {AssetBalanceModel, WalletModel, WalletType} from '../models';
import {ApiWalletModel} from '../models/walletModel';
import {BaseStore, RootStore} from './index';

const DEFAULT_BALANCE = 0;

class BalanceListStore extends BaseStore {
  tradingWallet: WalletModel;

  @computed
  get baseAssetBalance() {
    const asset = this.tradingWalletBalances.find((b: AssetBalanceModel) => {
      const baseAssetId = pathOr(
        '',
        ['baseAsset', 'id'],
        this.rootStore.uiStore.selectedInstrument
      );
      return b.id === baseAssetId;
    });
    return asset ? asset.available : DEFAULT_BALANCE;
  }

  @computed
  get quoteAssetBalance() {
    const asset = this.tradingWalletBalances.find((b: AssetBalanceModel) => {
      const quoteAssetId = pathOr(
        '',
        ['quoteAsset', 'id'],
        this.rootStore.uiStore.selectedInstrument
      );
      return b.id === quoteAssetId;
    });
    return asset ? asset.available : DEFAULT_BALANCE;
  }

  @computed
  get tradingWalletBalances() {
    return (this.tradingWallet && this.tradingWallet.balances) || [];
  }

  constructor(store: RootStore, private readonly api: BalanceListApi) {
    super(store);

    this.tradingWallet = new WalletModel({
      Id: 'Trading',
      Name: 'Trading',
      Balances: [],
      Type: 'Trading'
    });
  }

  hasFundsOnBalance = () =>
    this.tradingWallet.balances.map(wallet => wallet.balance).reduce(add, 0) >
    0;

  getTotalBalance = () =>
    this.tradingWallet ? this.tradingWallet.totalBalance : 0;

  getTotalBalanceInBaseAsset = () =>
    this.tradingWallet ? this.tradingWallet.totalBalanceInBaseAsset : 0;

  fetchAll = () => {
    return this.api
      .fetchAll()
      .then((resp: any) => {
        runInAction(() => {
          this.tradingWallet = resp
            .map((wallet: ApiWalletModel) => new WalletModel(wallet))
            .find((wallet: WalletModel) => wallet.type === WalletType.Trading);
        });
        return Promise.resolve();
      })
      .catch(Promise.reject);
  };

  @action
  updateWalletBalances = async () => {
    this.tradingWallet.balances.forEach(this.updateBalance);
  };

  updateBalance = async (assetBalance: AssetBalanceModel) => {
    const {
      baseAssetId,
      getInstrumentById,
      getAssetById,
      fetchAssetById
    } = this.rootStore.referenceStore;
    const {balance, id} = assetBalance;

    let asset = getAssetById(id);

    if (!asset) {
      asset = await fetchAssetById(id);
    }

    assetBalance.name = pathOr('', ['name'], asset);
    assetBalance.accuracy = pathOr('', ['accuracy'], asset);

    assetBalance.balanceInBaseAsset = this.rootStore.marketStore.convert(
      balance,
      id,
      baseAssetId,
      getInstrumentById
    );
  };

  subscribe = () => {
    this.rootStore.socketStore.subscribe(topics.balances, this.onUpdateBalance);
  };

  onUpdateBalance = async (args: any) => {
    const dto = args[0];
    const {id, a, b, r} = dto;
    if (this.tradingWallet && this.tradingWallet.id === id) {
      const balance = this.tradingWallet.balances.find(
        (bc: AssetBalanceModel) => bc.id === a
      );
      if (balance) {
        balance.balance = b;
        balance.reserved = r;
      } else {
        const newBalanceModel = new AssetBalanceModel({
          AssetId: a,
          Balance: b,
          Reserved: r
        });

        this.updateBalance(newBalanceModel);
        this.tradingWallet.balances.push(newBalanceModel);
      }
    }
  };

  reset = () => {
    this.tradingWallet.balances = [];
  };
}

export default BalanceListStore;
