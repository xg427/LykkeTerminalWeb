import * as React from 'react';
import ModalHeader from './ModalHeader/ModalHeader';
import {
  MarginedModalBody,
  MobileAppLink,
  ModalContentWrapper,
  ModalWrapper,
  OkButton
} from './styles';

import ModalMessages from '../../constants/modalMessages';

export interface ManageFundsModalProps {
  setManageFundsModalState: (state: boolean) => void;
}

const ManageFundsModal: React.SFC<ManageFundsModalProps> = ({
  setManageFundsModalState
}) => {
  const handleCancel = () => setManageFundsModalState(false);

  return (
    <ModalWrapper>
      <ModalHeader onClick={handleCancel} />
      <MarginedModalBody>{ModalMessages.manageWallets.body}</MarginedModalBody>
      <ModalContentWrapper>
        <MobileAppLink
          href={ModalMessages.manageWallets.link.appStore}
          target={'_blank'}
          onClick={handleCancel}
          image={'app-store'}
        />
        <MobileAppLink
          href={ModalMessages.manageWallets.link.playMarket}
          target={'_blank'}
          onClick={handleCancel}
          image={'google-play'}
        />
      </ModalContentWrapper>
      <OkButton onClick={handleCancel}>Got it!</OkButton>
    </ModalWrapper>
  );
};

export default ManageFundsModal;
