import rem from 'polished/lib/helpers/rem';
import styled from 'styled-components';

export const AuthWrap = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #000;
  font-size: ${rem(32)};
`;
