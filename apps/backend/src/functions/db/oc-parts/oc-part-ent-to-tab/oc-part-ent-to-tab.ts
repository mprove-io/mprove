import { Result } from '@praha/byethrow';
import type {
  OcPartEnt,
  OcPartTab
} from '#backend/drizzle/postgres/tables/oc-parts';
import { getTabProps } from '#backend/functions/get-tab-props/get-tab-props';
import type { TabService } from '#backend/services/tab/tab.service';
import type { OcPartEntToTabError } from '#common/types/backend/function-errors/oc-part-ent-to-tab-error';
import type { OcPartLt } from '#common/types/shared/st-lt/oc-parts/oc-part-lt';
import type { OcPartSt } from '#common/types/shared/st-lt/oc-parts/oc-part-st';

export function ocPartEntToTab(item: {
  ent: OcPartEnt;
  tabService: TabService;
}): Result.Result<OcPartTab, OcPartEntToTabError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('tabProps', v =>
      getTabProps<OcPartSt, OcPartLt>({
        ent: v.ent,
        tabService: v.tabService
      })
    ),
    Result.map((v): OcPartTab => ({ ...v.ent, ...v.tabProps.props }))
  );
}
