import { Result } from '@praha/byethrow';
import type { CachedColumnTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { CachedColumnsEnt } from '#backend/drizzle/postgres/schema/cached-columns';
import { getTabProps } from '#backend/functions/get-tab-props/get-tab-props';
import type { TabService } from '#backend/services/tab/tab.service';
import type { CachedColumnEntToTabError } from '#common/types/backend/function-errors/cached-column-ent-to-tab-error';
import type { CachedColumnLt } from '#common/types/shared/st-lt/cached-columns/cached-column-lt';
import type { CachedColumnSt } from '#common/types/shared/st-lt/cached-columns/cached-column-st';

export function cachedColumnEntToTab(item: {
  ent: CachedColumnsEnt;
  tabService: TabService;
}): Result.Result<CachedColumnTab, CachedColumnEntToTabError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('tabProps', v =>
      getTabProps<CachedColumnSt, CachedColumnLt>({
        ent: v.ent,
        tabService: v.tabService
      })
    ),
    Result.map((v): CachedColumnTab => ({ ...v.ent, ...v.tabProps.props }))
  );
}
