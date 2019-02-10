import * as actions from '@app/store-actions/_index';

export type ReposActions =
  | actions.UpdateReposStateAction
  | actions.ResetReposStateAction;
