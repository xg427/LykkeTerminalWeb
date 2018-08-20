import {inject} from 'mobx-react';
import * as React from 'react';
import {RouteComponentProps} from 'react-router';
import paths from '../../constants/paths';
import {AuthStore, BalanceListStore} from '../../stores/index';

interface AuthProps extends RouteComponentProps<any> {
  authStore: AuthStore;
  balanceListStore: BalanceListStore;
}

@inject('authStore', 'balanceListStore')
class Auth extends React.Component<AuthProps> {
  componentDidMount() {
    const {authStore, balanceListStore} = this.props;
    authStore.fetchToken().then(() =>
      authStore.fetchUserInfo().then(() => {
        balanceListStore.fetchAll().then(() => {
          if (authStore.noKycAndFunds) {
            return this.props.history.push(paths.kycAndFundsCheck);
          } else {
            this.props.history.push('/');
          }
        });
      })
    );
  }

  render() {
    return null;
  }
}

export default Auth;
