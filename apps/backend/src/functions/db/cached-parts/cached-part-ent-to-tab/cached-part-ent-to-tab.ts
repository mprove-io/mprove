import { Result } from '@praha/byethrow';
import type {
  CachedPartsEnt,
  CachedPartTab
} from '#backend/drizzle/postgres/tables/cached-parts';
import { getTabProps } from '#backend/functions/get-tab-props/get-tab-props';
import type { TabService } from '#backend/services/tab/tab.service';
import type { CachedPartEntToTabError } from '#common/types/backend/function-errors/cached-part-ent-to-tab-error';
import type { CachedPartLt } from '#common/types/shared/st-lt/cached-parts/cached-part-lt';
import type { CachedPartSt } from '#common/types/shared/st-lt/cached-parts/cached-part-st';

export function cachedPartEntToTab(item: {
  ent: CachedPartsEnt;
  tabService: TabService;
}): Result.Result<CachedPartTab, CachedPartEntToTabError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('tabProps', v =>
      getTabProps<CachedPartSt, CachedPartLt>({
        ent: v.ent,
        tabService: v.tabService
      })
    ),
    Result.map((v): CachedPartTab => ({ ...v.ent, ...v.tabProps.props }))
  );
}
