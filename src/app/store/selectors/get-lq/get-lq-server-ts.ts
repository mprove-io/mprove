import { createSelector } from '@ngrx/store';
import { getLqState } from 'src/app/store/selectors/get-state/get-lq-state';
import * as interfaces from 'src/app/interfaces/_index';

export const getLqServerTs = createSelector(
  getLqState,
  (state: interfaces.LqState) => state.server_ts
);
