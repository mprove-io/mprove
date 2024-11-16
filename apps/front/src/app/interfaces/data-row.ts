import { common } from '~front/barrels/common';

export interface DataRow extends common.Row {
  showParametersJson: boolean;
  isRepParametersHaveError: boolean;
  strParameters: string;
  finalRowHeight: number;
  // [col: string]: any;
}
