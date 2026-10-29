import { Result } from '@praha/byethrow';
import type {
  OcEventEnt,
  OcEventTab
} from '#backend/drizzle/postgres/tables/oc-events';
import { getTabProps } from '#backend/functions/get-tab-props/get-tab-props';
import type { TabService } from '#backend/services/tab/tab.service';
import type { OcEventEntToTabError } from '#common/types/backend/function-errors/oc-event-ent-to-tab-error';
import type { OcEventLt } from '#common/types/shared/st-lt/oc-events/oc-event-lt';
import type { OcEventSt } from '#common/types/shared/st-lt/oc-events/oc-event-st';

export function ocEventEntToTab(item: {
  ent: OcEventEnt;
  tabService: TabService;
}): Result.Result<OcEventTab, OcEventEntToTabError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('tabProps', v =>
      getTabProps<OcEventSt, OcEventLt>({
        ent: v.ent,
        tabService: v.tabService
      })
    ),
    Result.map((v): OcEventTab => ({ ...v.ent, ...v.tabProps.props }))
  );
}
