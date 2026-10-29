import { Result } from '@praha/byethrow';
import type {
  DashboardEnt,
  DashboardTab
} from '#backend/drizzle/postgres/tables/dashboards';
import { getTabProps } from '#backend/functions/get-tab-props/get-tab-props';
import type { TabService } from '#backend/services/tab/tab.service';
import type { DashboardEntToTabError } from '#common/types/backend/function-errors/dashboard-ent-to-tab-error';
import type { DashboardLt } from '#common/types/shared/st-lt/dashboards/dashboard-lt';
import type { DashboardSt } from '#common/types/shared/st-lt/dashboards/dashboard-st';

export function dashboardEntToTab(item: {
  ent: DashboardEnt;
  tabService: TabService;
}): Result.Result<DashboardTab, DashboardEntToTabError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('tabProps', v =>
      getTabProps<DashboardSt, DashboardLt>({
        ent: v.ent,
        tabService: v.tabService
      })
    ),
    Result.map((v): DashboardTab => ({ ...v.ent, ...v.tabProps.props }))
  );
}
