import QRCode from 'qrcode.react';
import * as React from 'react';
import ModalMessages from '../../constants/modalMessages';
import ModalHeader from './ModalHeader/ModalHeader';
import {
  ModalBody,
  ModalTitle,
  QRBody,
  QRButton,
  QRCodeWrapper,
  SessionQRConfirm
} from './styles';

export interface QRModalProps {
  setQRModalState: (state: boolean) => void;
  qrId: string;
  continueInReadOnlyMode: () => void;
}

const QRModal: React.SFC<QRModalProps> = ({
  setQRModalState,
  qrId,
  continueInReadOnlyMode
}: QRModalProps) => {
  const handleContinue = () => {
    setQRModalState(false);
    continueInReadOnlyMode();
  };

  return (
    <SessionQRConfirm>
      <ModalHeader onClick={handleContinue}>
        <ModalTitle>{ModalMessages.qr.title}</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <div style={{width: '300px'}}>{ModalMessages.qr.body}</div>
      </ModalBody>
      <QRBody>
        <QRCodeWrapper>
          <QRCode size={160} value={qrId} />
        </QRCodeWrapper>
      </QRBody>
      <QRButton onClick={handleContinue}>{ModalMessages.qr.button}</QRButton>
    </SessionQRConfirm>
  );
};

export default QRModal;
