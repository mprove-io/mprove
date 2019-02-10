import * as actions from '@app/store-actions/_index';

export type ErrorsActions =
  | actions.UpdateErrorsStateAction
  | actions.ResetErrorsStateAction
  | actions.CleanErrorsStateAction;
