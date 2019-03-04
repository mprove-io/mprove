import * as actions from '@app/store-actions/actions';

export type MconfigsActions =
  | actions.UpdateMconfigsStateAction
  | actions.ResetMconfigsStateAction
  | actions.CleanMconfigsStateAction;
