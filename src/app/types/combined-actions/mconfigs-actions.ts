import * as actions from '@app/store-actions/_index';

export type MconfigsActions =
  | actions.UpdateMconfigsStateAction
  | actions.ResetMconfigsStateAction
  | actions.CleanMconfigsStateAction;
