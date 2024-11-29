import { common } from '~blockml/barrels/common';

export type accessType =
  | common.FileView
  | common.FileModel
  | common.FileDashboard
  | common.FileChart
  | common.FileReport;
