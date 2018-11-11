import { createSelector } from '@ngrx/store';
import * as interfaces from 'src/app/interfaces/_index';
import { getUserState } from 'src/app/store/selectors/get-state/get-user-state';

export const getUserLoaded = createSelector(
  getUserState,
  (state: interfaces.UserState) => state.loaded
);
