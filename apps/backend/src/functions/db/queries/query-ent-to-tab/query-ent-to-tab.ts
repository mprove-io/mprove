import { Result } from '@praha/byethrow';
import type {
  QueryEnt,
  QueryTab
} from '#backend/drizzle/postgres/tables/queries';
import { getTabProps } from '#backend/functions/get-tab-props/get-tab-props';
import type { TabService } from '#backend/services/tab/tab.service';
import type { QueryEntToTabError } from '#common/types/backend/function-errors/query-ent-to-tab-error';
import type { QueryLt } from '#common/types/shared/st-lt/queries/query-lt';
import type { QuerySt } from '#common/types/shared/st-lt/queries/query-st';

export function queryEntToTab(item: {
  ent: QueryEnt;
  tabService: TabService;
}): Result.Result<QueryTab, QueryEntToTabError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('tabProps', v =>
      getTabProps<QuerySt, QueryLt>({
        ent: v.ent,
        tabService: v.tabService
      })
    ),
    Result.map((v): QueryTab => ({ ...v.ent, ...v.tabProps.props }))
  );
}
