import * as actions from '@app/store/actions/_index';

export type ModelsActions =
  | actions.UpdateModelsStateAction
  | actions.ResetModelsStateAction
  | actions.CleanModelsStateAction;
