import * as actions from '@app/store-actions/actions';

export type ReposActions =
  | actions.UpdateReposStateAction
  | actions.ResetReposStateAction;
