import {observable} from 'mobx';
import {BaseStore, RootStore} from './index';

class ModalStore extends BaseStore {
  @observable private isQRModalOpen: boolean = false;
  @observable private isSessionConfirmationModalOpen: boolean = false;
  @observable private isMissedKysModalOpen: boolean = false;
  @observable private isManageFundsModalOpen: boolean = false;

  constructor(store: RootStore) {
    super(store);
  }

  getQRModalState = () => this.isQRModalOpen;
  setQRModalState = (state: boolean) => (this.isQRModalOpen = state);

  getSessionConfirmationModalState = () => this.isSessionConfirmationModalOpen;
  setSessionConfirmationModalState = (state: boolean) =>
    (this.isSessionConfirmationModalOpen = state);

  getMissedKycModalState = () => this.isMissedKysModalOpen;
  setMissedKycModalState = (state: boolean) =>
    (this.isMissedKysModalOpen = state);

  getManageFundsModalState = () => this.isManageFundsModalOpen;
  setManageFundsModalState = (state: boolean) =>
    (this.isManageFundsModalOpen = state);

  reset = () => {
    this.setQRModalState(false);
    this.setSessionConfirmationModalState(false);
    this.setMissedKycModalState(false);
    return;
  };
}

export default ModalStore;
