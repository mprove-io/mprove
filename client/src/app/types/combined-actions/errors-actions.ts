import * as actions from '@app/store-actions/actions';

export type ErrorsActions =
  | actions.UpdateErrorsStateAction
  | actions.ResetErrorsStateAction
  | actions.CleanErrorsStateAction;
