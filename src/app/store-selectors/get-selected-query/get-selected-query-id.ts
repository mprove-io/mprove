import { createSelector } from '@ngrx/store';
import { getSelectedQuery } from '@app/store-selectors/get-selected-query/get-selected-query';
import * as api from '@app/api/_index';

export const getSelectedQueryId = createSelector(
  getSelectedQuery,
  (query: api.Query) => (query ? query.query_id : undefined)
);
