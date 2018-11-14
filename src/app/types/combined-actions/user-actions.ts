import * as actions from 'app/store/actions/_index';

export type UserActions =
  | actions.UpdateUserStateAction
  | actions.ResetUserStateAction;
