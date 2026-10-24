import { Result } from '@praha/byethrow';
import type { MconfigTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { MconfigEnt } from '#backend/drizzle/postgres/schema/mconfigs';
import { getTabProps } from '#backend/functions/get-tab-props/get-tab-props';
import type { TabService } from '#backend/services/tab/tab.service';
import type { MconfigEntToTabError } from '#common/types/backend/function-errors/mconfig-ent-to-tab-error';
import type { MconfigLt } from '#common/types/shared/st-lt/mconfigs/mconfig-lt';
import type { MconfigSt } from '#common/types/shared/st-lt/mconfigs/mconfig-st';

export function mconfigEntToTab(item: {
  ent: MconfigEnt;
  tabService: TabService;
}): Result.Result<MconfigTab, MconfigEntToTabError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('tabProps', v =>
      getTabProps<MconfigSt, MconfigLt>({
        ent: v.ent,
        tabService: v.tabService
      })
    ),
    Result.map((v): MconfigTab => ({ ...v.ent, ...v.tabProps.props }))
  );
}
