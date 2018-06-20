import * as React from 'react';
import CloseButton from '../CloseButton/CloseButton';
import {SessionDurationSelection} from '../Settings';
import {Body, CloseBtnPosition, SessionSettings} from './styles';

interface SettingsProps {
  onSettingsClose: () => void;
  onDurationSet: () => void;
}

const Settings: React.SFC<SettingsProps> = ({
  onSettingsClose,
  onDurationSet
}) => {
  return (
    <SessionSettings>
      <CloseButton
        onClose={onSettingsClose}
        top={CloseBtnPosition.top}
        right={CloseBtnPosition.right}
      />
      <Body>Change the duration of sessions</Body>
      <SessionDurationSelection onDurationSet={onDurationSet} />
    </SessionSettings>
  );
};

export default Settings;
