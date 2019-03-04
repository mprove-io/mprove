import * as actions from '@app/store-actions/actions';

export type ModelsActions =
  | actions.UpdateModelsStateAction
  | actions.ResetModelsStateAction
  | actions.CleanModelsStateAction;
