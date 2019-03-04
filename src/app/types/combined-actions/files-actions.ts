import * as actions from '@app/store-actions/actions';

export type FilesActions =
  | actions.UpdateFilesStateAction
  | actions.ResetFilesStateAction;
