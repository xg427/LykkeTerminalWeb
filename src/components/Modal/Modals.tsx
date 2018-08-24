import * as React from 'react';
import {KycModal, ManageFundsModal, QRModal} from './index';

import ExpiredModal from './ExpiredModal';

export interface ModalsProps {
  isQRModalOpen: boolean;
  isMissedKysModalOpen: boolean;
  isSessionConfirmationModalOpen: boolean;
  isManageFundsModalOpen: boolean;
}

const Modals = ({
  isQRModalOpen,
  isMissedKysModalOpen,
  isSessionConfirmationModalOpen,
  isManageFundsModalOpen
}: ModalsProps) => {
  return (
    <React.Fragment>
      {isQRModalOpen && <QRModal />}

      {isMissedKysModalOpen && <KycModal />}

      {isSessionConfirmationModalOpen && <ExpiredModal />}

      {isManageFundsModalOpen && <ManageFundsModal />}
    </React.Fragment>
  );
};

export default Modals;
