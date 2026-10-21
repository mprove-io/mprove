import { Result } from '@praha/byethrow';
import type { KitTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { KitEnt } from '#backend/drizzle/postgres/schema/kits';
import { getTabProps } from '#backend/functions/get-tab-props/get-tab-props';
import type { TabService } from '#backend/services/tab/tab.service';
import type { KitEntToTabError } from '#common/types/backend/function-errors/kit-ent-to-tab-error';
import type { KitLt } from '#common/types/shared/st-lt/kits/kit-lt';
import type { KitSt } from '#common/types/shared/st-lt/kits/kit-st';

export function kitEntToTab(item: {
  ent: KitEnt;
  tabService: TabService;
}): Result.Result<KitTab, KitEntToTabError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('tabProps', v =>
      getTabProps<KitSt, KitLt>({
        ent: v.ent,
        tabService: v.tabService
      })
    ),
    Result.map((v): KitTab => ({ ...v.ent, ...v.tabProps.props }))
  );
}
