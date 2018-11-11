import { createSelector } from '@ngrx/store';
import { getRouterState } from 'src/app/store/selectors/get-state/get-router-state';

export const getRouterPath = createSelector(
  getRouterState,
  router => router.state.url
);
