import { Result } from '@praha/byethrow';
import type { OcSessionTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { OcSessionEnt } from '#backend/drizzle/postgres/schema/oc-sessions';
import { getTabProps } from '#backend/functions/get-tab-props/get-tab-props';
import type { TabService } from '#backend/services/tab/tab.service';
import type { OcSessionEntToTabError } from '#common/types/backend/function-errors/oc-session-ent-to-tab-error';
import type { OcSessionLt } from '#common/types/shared/st-lt/oc-sessions/oc-session-lt';
import type { OcSessionSt } from '#common/types/shared/st-lt/oc-sessions/oc-session-st';

export function ocSessionEntToTab(item: {
  ent: OcSessionEnt;
  tabService: TabService;
}): Result.Result<OcSessionTab, OcSessionEntToTabError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('tabProps', v =>
      getTabProps<OcSessionSt, OcSessionLt>({
        ent: v.ent,
        tabService: v.tabService
      })
    ),
    Result.map((v): OcSessionTab => ({ ...v.ent, ...v.tabProps.props }))
  );
}
