import { createSelector } from '@ngrx/store';
import { getUserState } from '@app/store/selectors/get-state/get-user-state';
import * as interfaces from '@app/interfaces/_index';

export const getUserAlias = createSelector(
  getUserState,
  (state: interfaces.UserState) => state.alias
);
