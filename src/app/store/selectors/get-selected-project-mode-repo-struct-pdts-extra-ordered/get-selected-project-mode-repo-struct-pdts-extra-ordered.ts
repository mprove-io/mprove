import { createSelector } from '@ngrx/store';
import * as api from 'app/api/_index';
import * as interfaces from 'app/interfaces/_index';
import { getQueriesState } from 'app/store/selectors/get-state/get-queries-state';
import { getSelectedProjectModeRepoPdtsSorted } from 'app/store/selectors/get-selected-project-mode-repo/get-selected-project-mode-repo-pdts-sorted';

export const getSelectedProjectModeRepoStructPdtsExtraOrdered = createSelector(
  getQueriesState,
  getSelectedProjectModeRepoPdtsSorted,
  (queries, pdtsSorted) => {
    let queriesPdtExtraOrdered: interfaces.QueryExtra[] = [];

    if (queries && pdtsSorted) {
      pdtsSorted.forEach(x => {
        let query: api.Query = queries.find((q: api.Query) => q.pdt_id === x);

        if (query) {
          let durationCeil = query.last_complete_duration
            ? Math.ceil(query.last_complete_duration / 1000)
            : 0;

          let queryExtra: interfaces.QueryExtra = Object.assign({}, query, {
            extra_is_completed: query.last_complete_ts > 1,
            extra_last_complete_duration_ceil: durationCeil
          });

          queriesPdtExtraOrdered.push(queryExtra);
        }
      });
    }

    return queriesPdtExtraOrdered;
  }
);
