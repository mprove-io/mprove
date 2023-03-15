import { common } from '~blockml/barrels/common';

export interface Api extends common.FileBasic {
  api?: string;
  api_line_num?: number;

  label?: string;
  label_line_num?: number;

  steps?: any[];
  steps_line_num?: number;
}
