import { common } from '~blockml/barrels/common';

export type vmdrType =
  | common.FileView
  | common.FileModel
  | common.FileDashboard
  | common.FileReport;
