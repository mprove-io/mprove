// tslint:disable:max-line-length
import { createSelector } from '@ngrx/store';
import { getSelectedProjectModeRepoPdtsSorted } from 'app/store/selectors/get-selected-project-mode-repo/get-selected-project-mode-repo-pdts-sorted';
import { getSelectedQuery } from 'app/store/selectors/get-selected-query/get-selected-query';
import { getQueriesState } from 'app/store/selectors/get-state/get-queries-state';
import * as api from 'app/api/_index';

export const getSelectedQueryPdtsAllOrdered = createSelector(
  getSelectedQuery,
  getQueriesState, // getSelectedProjectModeRepoStructPdts,
  getSelectedProjectModeRepoPdtsSorted,
  (query: api.Query, queries: api.Query[], ptdsSorted: string[]) => {
    let queryPdtsOrdered: api.Query[] = [];
    let queryPdts: api.Query[] = [];

    if (query && queries && ptdsSorted && query.pdt_deps_all.length > 0) {
      query.pdt_deps_all.forEach(dep => {
        let queryPdt = queries.find(q => q.pdt_id === dep);

        if (queryPdt) {
          queryPdts.push(queryPdt);
        }
      });

      ptdsSorted.forEach(x => {
        let queryP = queryPdts.find((q: api.Query) => q.pdt_id === x);

        if (queryP) {
          queryPdtsOrdered.push(queryP);
        }
      });
    }

    return queryPdtsOrdered;
  }
);
