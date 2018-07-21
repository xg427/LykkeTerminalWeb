import {colorFromSide} from '../styled';
import {Cell} from '../Table';

export const SideCell = Cell.extend`
  ${(p: any) => colorFromSide(p)};
  text-align: left !important;
` as any;
