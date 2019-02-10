import * as actions from '@app/store-actions/actions';

export type UserActions =
  | actions.UpdateUserStateAction
  | actions.ResetUserStateAction;
