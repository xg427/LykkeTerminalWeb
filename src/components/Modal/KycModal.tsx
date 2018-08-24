import * as React from 'react';
import ModalMessages from '../../constants/modalMessages';
import ModalHeader from './ModalHeader/ModalHeader';
import {
  Modal,
  StyledApplications,
  StyledAppStore,
  StyledButton,
  StyledGooglePlay,
  StyledKycModalHeader,
  StyledText
} from './styles';

export interface KycModalProps {
  setMissedKycModalState: (state: boolean) => void;
}

const KycModal: React.SFC<KycModalProps> = ({setMissedKycModalState}) => {
  const handleClose = () => setMissedKycModalState(false);

  return (
    <Modal>
      <StyledKycModalHeader>
        <ModalHeader
          title={ModalMessages.missedKyc.title}
          onClick={handleClose}
        />
      </StyledKycModalHeader>
      <StyledText>{ModalMessages.missedKyc.body}</StyledText>
      <StyledApplications>
        <a href="https://itunes.apple.com/us/app/lykke-wallet/id1112839581">
          <StyledAppStore />
        </a>
        <a href="https://play.google.com/store/apps/details?id=com.lykkex.LykkeWallet">
          <StyledGooglePlay />
        </a>
      </StyledApplications>
      <StyledButton onClick={handleClose}>Ok</StyledButton>
    </Modal>
  );
};

export default KycModal;
