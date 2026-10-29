import { Result } from '@praha/byethrow';
import type {
  SessionEnt,
  SessionTab
} from '#backend/drizzle/postgres/tables/sessions';
import { getTabProps } from '#backend/functions/get-tab-props/get-tab-props';
import type { TabService } from '#backend/services/tab/tab.service';
import type { SessionEntToTabError } from '#common/types/backend/function-errors/session-ent-to-tab-error';
import type { SessionLt } from '#common/types/shared/st-lt/sessions/session-lt';
import type { SessionSt } from '#common/types/shared/st-lt/sessions/session-st';

export function sessionEntToTab(item: {
  ent: SessionEnt;
  tabService: TabService;
}): Result.Result<SessionTab, SessionEntToTabError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('tabProps', v =>
      getTabProps<SessionSt, SessionLt>({
        ent: v.ent,
        tabService: v.tabService
      })
    ),
    Result.map((v): SessionTab => ({ ...v.ent, ...v.tabProps.props }))
  );
}
