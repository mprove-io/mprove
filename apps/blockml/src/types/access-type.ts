import { common } from '~blockml/barrels/common';

export type accessType =
  | common.FileModel
  | common.FileDashboard
  | common.FileChart
  | common.FileReport;
