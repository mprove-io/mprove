import { common } from '~front/barrels/common';

export interface DataRow extends common.Row {
  showMetricsParameters: boolean;
  finalRowHeight: number;
}
