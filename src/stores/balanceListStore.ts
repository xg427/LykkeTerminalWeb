import {computed, observable, runInAction} from 'mobx';
import {add, pathOr} from 'rambda';
import {BalanceListApi} from '../api/index';
import {default as storageKeys} from '../constants/storageKeys';
import keys from '../constants/tradingWalletKeys';
import {AssetBalanceModel, WalletModel} from '../models';
import MarketService from '../services/marketService';
import {StorageUtils} from '../utils/index';
import {BaseStore, RootStore} from './index';

const baseAssetStorage = StorageUtils(storageKeys.baseAsset);

class BalanceListStore extends BaseStore {
  @computed
  get getBalances() {
    return this.walletList
      .filter(b => b.totalBalance > 0)
      .sort((a, b) => b.totalBalance - a.totalBalance);
  }

  @computed
  get totalBalance() {
    return this.walletList.map(b => b.totalBalance).reduce(add, 0);
  }

  @computed
  get tradingWalletAssets() {
    return this.tradingAssets.filter((a: AssetBalanceModel) => !!a.balance);
  }

  @computed
  get tradingWalletTotal() {
    return this.tradingTotal;
  }

  @observable.shallow private walletList: WalletModel[] = [];
  @observable.shallow private tradingAssets: AssetBalanceModel[] = [];
  @observable private tradingTotal: number = 0;

  constructor(store: RootStore, private readonly api: BalanceListApi) {
    super(store);
  }

  fetchAll = () => {
    return this.api
      .fetchAll()
      .then((resp: any) => {
        runInAction(() => {
          const balanceList = resp.map(
            (wallet: any) => new WalletModel(wallet)
          );
          this.updateBalance(balanceList);
          this.setTradingAssets(balanceList);
        });
        return Promise.resolve();
      })
      .catch(Promise.reject);
  };

  updateBalance = async (walletList: WalletModel[] = this.walletList) => {
    const promises = walletList.map(balanceList =>
      balanceList.updateTotalBalance(this.rootStore.referenceStore)
    );
    await Promise.all(promises);
    this.walletList = [...walletList];
  };

  setTradingAssets = async (walletList: WalletModel[]) => {
    const {getAssetById} = this.rootStore.referenceStore;
    this.tradingAssets = this.getTradingWallet(walletList)
      .balances.map((dto: any) => {
        const assetBalance = new AssetBalanceModel(dto);
        const assetById = getAssetById(assetBalance.id);
        assetBalance.name = pathOr('', ['name'], assetById);
        assetBalance.accuracy = pathOr('', ['accuracy'], assetById);
        return assetBalance;
      })
      .filter(a => a.id && a.name);

    await this.updateTradingWallet();
  };

  updateTradingWallet = async () => {
    const assets = this.tradingAssets.map(asset => ({
      AssetId: asset.id,
      Balance: asset.available
    }));
    const baseAssetId = baseAssetStorage.get();

    const updatedBalances: any[] = await MarketService.convert(
      assets,
      baseAssetId!
    );
    this.tradingAssets = this.tradingAssets.map(a => {
      const balanceInBaseAsset = pathOr(
        0,
        ['Balance'],
        updatedBalances.find(b => b.FromAssetId === a.id)
      );
      a.balanceInBaseAsset = balanceInBaseAsset;
      return a;
    });
    this.tradingTotal = updatedBalances.map(b => b.Balance).reduce(add, 0);

    const balanceInBaseAssetExists = this.tradingAssets.some(a =>
      this.eqToBaseAssetId(a, baseAssetId!)
    );
    if (balanceInBaseAssetExists) {
      const balancesInBaseAsset = this.tradingAssets.filter(a =>
        this.eqToBaseAssetId(a, baseAssetId!)
      );
      balancesInBaseAsset.forEach(b => (b.balanceInBaseAsset = b.balance));
      this.tradingTotal += balancesInBaseAsset
        .map(a => a.available)
        .reduce(add, 0);
    }
  };

  subscribe = (session: any) => {
    session.subscribe(`balances`, this.onUpdateBalance);
  };

  onUpdateBalance = async (args: any) => {
    const {a: asset, b: balance, r: reserved} = args[0];
    const assetBalance = this.tradingAssets.find(b => b.id === asset);
    if (assetBalance) {
      assetBalance.balance = balance;
      assetBalance.reserved = reserved;
    }
    this.updateTradingWallet();

    this.walletList.forEach((wallet: WalletModel) =>
      wallet.balances.forEach(b => {
        if (b.AssetId === asset) {
          b.Balance = balance;
        }
      })
    );
    this.updateBalance(this.walletList);
  };

  reset = () => {
    this.walletList = [];
    this.tradingAssets = [];
  };

  private getTradingWallet = (walletList: WalletModel[]) => {
    return walletList.find(b => b.type === keys.trading)!;
  };

  private eqToBaseAssetId = (a: AssetBalanceModel, baseAssetId: string) =>
    a.id === baseAssetId;
}

export default BalanceListStore;
