import * as actions from 'app/store/actions/_index';

export type FilesActions =
  | actions.UpdateFilesStateAction
  | actions.ResetFilesStateAction;
