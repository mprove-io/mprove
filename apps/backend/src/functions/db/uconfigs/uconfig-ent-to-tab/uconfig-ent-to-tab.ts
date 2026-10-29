import { Result } from '@praha/byethrow';
import type {
  UconfigEnt,
  UconfigTab
} from '#backend/drizzle/postgres/tables/uconfigs';
import { getTabProps } from '#backend/functions/get-tab-props/get-tab-props';
import type { TabService } from '#backend/services/tab/tab.service';
import type { UconfigEntToTabError } from '#common/types/backend/function-errors/uconfig-ent-to-tab-error';
import type { UconfigLt } from '#common/types/shared/st-lt/uconfigs/uconfig-lt';
import type { UconfigSt } from '#common/types/shared/st-lt/uconfigs/uconfig-st';

export function uconfigEntToTab(item: {
  ent: UconfigEnt;
  tabService: TabService;
}): Result.Result<UconfigTab, UconfigEntToTabError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('tabProps', v =>
      getTabProps<UconfigSt, UconfigLt>({
        ent: v.ent,
        tabService: v.tabService
      })
    ),
    Result.map((v): UconfigTab => ({ ...v.ent, ...v.tabProps.props }))
  );
}
