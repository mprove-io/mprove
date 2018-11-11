import { createSelector } from '@ngrx/store';
import { getUserState } from 'src/app/store/selectors/get-state/get-user-state';
import * as interfaces from 'src/app/interfaces/_index';

export const getUserServerTs = createSelector(
  getUserState,
  (state: interfaces.UserState) => state.server_ts
);
