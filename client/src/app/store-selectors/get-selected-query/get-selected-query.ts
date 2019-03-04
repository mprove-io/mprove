import { createSelector } from '@ngrx/store';
import { getLayoutQueryId } from '@app/store-selectors/get-layout/get-layout-query-id';
import { getQueriesState } from '@app/store-selectors/get-state/get-queries-state';
import * as api from '@app/api/_index';

export const getSelectedQuery = createSelector(
  getQueriesState,
  getLayoutQueryId,
  (queries: api.Query[], queryId: string) => {
    if (queries && queryId) {
      let query = queries.find((q: api.Query) => q.query_id === queryId);

      return query ? query : undefined;
    } else {
      return undefined;
    }
  }
);
