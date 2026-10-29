import { Result } from '@praha/byethrow';
import type {
  DconfigEnt,
  DconfigTab
} from '#backend/drizzle/postgres/tables/dconfigs';
import { getTabProps } from '#backend/functions/get-tab-props/get-tab-props';
import type { TabService } from '#backend/services/tab/tab.service';
import type { DconfigEntToTabError } from '#common/types/backend/function-errors/dconfig-ent-to-tab-error';
import type { DconfigLt } from '#common/types/shared/st-lt/dconfigs/dconfig-lt';
import type { DconfigSt } from '#common/types/shared/st-lt/dconfigs/dconfig-st';

export function dconfigEntToTab(item: {
  ent: DconfigEnt;
  tabService: TabService;
}): Result.Result<DconfigTab, DconfigEntToTabError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('tabProps', v =>
      getTabProps<DconfigSt, DconfigLt>({
        ent: v.ent,
        tabService: v.tabService
      })
    ),
    Result.map((v): DconfigTab => ({ ...v.ent, ...v.tabProps.props }))
  );
}
