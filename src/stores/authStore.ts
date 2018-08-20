import {computed, observable} from 'mobx';
import {UserManager} from 'oidc-client';
import {AuthApi} from '../api/index';
import messages from '../constants/notificationMessages';
import {openIdConstants} from '../constants/openId';
import {keys, KycStatuses, levels, UserInfoModel} from '../models';
import {StorageUtils} from '../utils/index';
import {BaseStore, RootStore} from './index';

const tokenStorage = StorageUtils(keys.token);
const stateStorage = StorageUtils(keys.state);
const sessionTokenStorage = StorageUtils(keys.sessionToken);
const kycStatusStorage = StorageUtils(keys.isKycPassed);

class AuthStore extends BaseStore {
  @computed
  get isAuth() {
    return !!this.token;
  }

  @computed
  get isKycPassed() {
    return (
      this.kycStatus === KycStatuses.ReviewDone ||
      this.kycStatus === KycStatuses.Ok
    );
  }

  @computed
  get noKycAndFunds() {
    return (
      !this.isKycPassed || !this.rootStore.balanceListStore.hasFundsOnBalance()
    );
  }

  @observable userInfo: UserInfoModel;

  @observable private token: string = tokenStorage.get() || '';
  @observable private kycStatus: string = kycStatusStorage.get() || '';
  private userManager: UserManager;

  constructor(store: RootStore, private readonly api: AuthApi) {
    super(store);

    const settings = {
      authority: process.env.REACT_APP_AUTH_URL!,
      client_id: process.env.REACT_APP_ID!,
      redirect_uri:
        process.env.REACT_APP_CALLBACK_URL &&
        process.env.REACT_APP_CALLBACK_URL.toString(),
      post_logout_redirect_uri: location.origin,
      silent_redirect_uri: openIdConstants.silentRedirectUri,
      response_type: openIdConstants.responseType,
      scope: openIdConstants.scope,
      filterProtocolClaims: true,
      loadUserInfo: false,
      automaticSilentRenew: true
    };

    this.userManager = new UserManager(settings);
  }

  fetchBearerToken = (email: string, password: string) =>
    this.api
      .fetchBearerToken('/client/auth', email, password)
      .then((resp: any) => {
        this.token = resp.AccessToken;
        tokenStorage.set(this.token);
        return Promise.resolve();
      })
      .catch((err: any) => Promise.reject(JSON.parse(err.message)));

  fetchToken = async () => {
    const user = await this.userManager.signinRedirectCallback();
    const {access_token} = user;
    const {token, authId} = await this.api.fetchToken(access_token);
    sessionTokenStorage.set(authId);
    this.token = token;
    tokenStorage.set(token);
    stateStorage.clear();
    return Promise.resolve();
  };

  fetchUserInfo = async () => {
    const userInfo = await this.api.fetchUserInfo();
    const {KycStatus} = userInfo;

    this.userInfo = new UserInfoModel(userInfo);
    this.kycStatus = KycStatus;
    kycStatusStorage.set(KycStatus);
    this.rootStore.uiStore.setUserInfo(userInfo);
  };

  catchUnauthorized = () => {
    this.rootStore.notificationStore.addNotification(
      levels.information,
      messages.expired
    );
    this.signOut();
  };

  signIn = async () => {
    return this.userManager.signinRedirect();
  };

  signOut = async () => {
    this.rootStore.reset();
    await this.userManager.signoutRedirect();
  };

  reset = () => {
    this.kycStatus = '';
    this.token = '';
    kycStatusStorage.clear();
    tokenStorage.clear();
    sessionTokenStorage.clear();
  };
}

export default AuthStore;
