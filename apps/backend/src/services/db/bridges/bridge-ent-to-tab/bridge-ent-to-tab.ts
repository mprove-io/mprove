import { Result } from '@praha/byethrow';
import type { BridgeTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { BridgeEnt } from '#backend/drizzle/postgres/schema/bridges';
import { getTabProps } from '#backend/functions/get-tab-props/get-tab-props';
import type { TabService } from '#backend/services/tab/tab.service';
import type { BridgeEntToTabError } from '#common/types/backend/function-errors/bridge-ent-to-tab-error';
import type { BridgeLt } from '#common/types/shared/st-lt/bridges/bridge-lt';
import type { BridgeSt } from '#common/types/shared/st-lt/bridges/bridge-st';

export function bridgeEntToTab(item: {
  ent: BridgeEnt;
  tabService: TabService;
}): Result.Result<BridgeTab, BridgeEntToTabError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('tabProps', v =>
      getTabProps<BridgeSt, BridgeLt>({
        ent: v.ent,
        tabService: v.tabService
      })
    ),
    Result.map((v): BridgeTab => ({ ...v.ent, ...v.tabProps.props }))
  );
}
