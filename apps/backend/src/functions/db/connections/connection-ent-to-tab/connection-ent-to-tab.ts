import { Result } from '@praha/byethrow';
import type { ConnectionTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { ConnectionEnt } from '#backend/drizzle/postgres/schema/connections';
import { getTabProps } from '#backend/functions/get-tab-props/get-tab-props';
import type { TabService } from '#backend/services/tab/tab.service';
import type { ConnectionEntToTabError } from '#common/types/backend/function-errors/connection-ent-to-tab-error';
import type { ConnectionLt } from '#common/types/shared/st-lt/connections/connection-lt';
import type { ConnectionSt } from '#common/types/shared/st-lt/connections/connection-st';

export function connectionEntToTab(item: {
  ent: ConnectionEnt;
  tabService: TabService;
}): Result.Result<ConnectionTab, ConnectionEntToTabError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('tabProps', v =>
      getTabProps<ConnectionSt, ConnectionLt>({
        ent: v.ent,
        tabService: v.tabService
      })
    ),
    Result.map((v): ConnectionTab => ({ ...v.ent, ...v.tabProps.props }))
  );
}
