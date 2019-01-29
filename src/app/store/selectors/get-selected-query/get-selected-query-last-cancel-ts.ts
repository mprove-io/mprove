import { createSelector } from '@ngrx/store';
import { getSelectedQuery } from '@app/store/selectors/get-selected-query/get-selected-query';
import * as api from '@app/api/_index';

export const getSelectedQueryLastCancelTs = createSelector(
  getSelectedQuery,
  (query: api.Query) => (query ? query.last_cancel_ts : undefined)
);
