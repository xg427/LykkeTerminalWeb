import * as React from 'react';
import {
  Expired,
  ModalBody,
  ModalTitle,
  SessionExpiredImage,
  StyledButton
} from './styles';

import ModalMessages from '../../constants/modalMessages';
import withModal from './withModal';

const ExpiredModal: React.SFC<{}> = () => {
  return (
    <Expired>
      <SessionExpiredImage />
      <ModalTitle>{ModalMessages.expired.title}</ModalTitle>
      <ModalBody>{ModalMessages.expired.body}</ModalBody>
      {/* tslint:disable-next-line:jsx-no-lambda */}
      <StyledButton onClick={() => location.reload()}>Turn on 2FA</StyledButton>
    </Expired>
  );
};

export default withModal(ExpiredModal);
