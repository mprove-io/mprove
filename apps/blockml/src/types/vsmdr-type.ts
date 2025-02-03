import { common } from '~blockml/barrels/common';

export type vsmdrType =
  | common.FileView
  | common.FileStore
  | common.FileModel
  | common.FileDashboard
  | common.FileReport;
