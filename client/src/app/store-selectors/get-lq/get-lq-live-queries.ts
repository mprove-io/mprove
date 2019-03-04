import { createSelector } from '@ngrx/store';
import { getLqState } from '@app/store-selectors/get-state/get-lq-state';
import * as interfaces from '@app/interfaces/_index';

export const getLqLiveQueries = createSelector(
  getLqState,
  (state: interfaces.LqState) => state.live_queries
);
