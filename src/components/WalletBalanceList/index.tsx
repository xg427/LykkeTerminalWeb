import {observer} from 'mobx-react';
import {connect} from '../connect';
import {withStyledScroll} from '../CustomScrollbar';
import WalletBalanceItem from './WalletBalanceItem/WalletBalanceItem';
import WalletBalanceList, {WalletBalanceListProps} from './WalletBalanceList';

const ConnectedWalletBalanceList = connect<WalletBalanceListProps>(
  ({
    balanceListStore: {tradingWallet},
    uiStore: {selectedInstrument},
    uiOrderStore: {setSide, getPercentChangeHandle}
  }) => ({
    wallet: tradingWallet,
    assets: tradingWallet && tradingWallet.balances,
    selectedInstrument,
    setSide,
    handlePercentageChange: getPercentChangeHandle()
  }),
  withStyledScroll({height: 'calc(100% - 1.5rem)'})(observer(WalletBalanceList))
);

const ObservedWalletBalanceItem = observer(WalletBalanceItem);

export {ConnectedWalletBalanceList as WalletBalanceList};
export {ObservedWalletBalanceItem as WalletBalanceItem};
