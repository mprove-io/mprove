import { FractionLogicEnum } from '~common/enums/fraction/fraction-logic.enum';
import { FileStoreFractionControl } from './file-store-fraction-control';

export interface FileStoreFractionType {
  type?: string;
  type_line_num?: number;

  label?: string;
  label_line_num?: number;

  meta?: any;
  meta_line_num?: any;

  controls?: FileStoreFractionControl[];
  controls_line_num?: any;

  //

  logicGroup?: FractionLogicEnum;
}
