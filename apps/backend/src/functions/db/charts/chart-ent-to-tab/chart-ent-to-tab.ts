import { Result } from '@praha/byethrow';
import type { ChartTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { ChartEnt } from '#backend/drizzle/postgres/schema/charts';
import { getTabProps } from '#backend/functions/get-tab-props/get-tab-props';
import type { TabService } from '#backend/services/tab/tab.service';
import type { ChartEntToTabError } from '#common/types/backend/function-errors/chart-ent-to-tab-error';
import type { ChartLt } from '#common/types/shared/st-lt/charts/chart-lt';
import type { ChartSt } from '#common/types/shared/st-lt/charts/chart-st';

export function chartEntToTab(item: {
  ent: ChartEnt;
  tabService: TabService;
}): Result.Result<ChartTab, ChartEntToTabError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('tabProps', v =>
      getTabProps<ChartSt, ChartLt>({
        ent: v.ent,
        tabService: v.tabService
      })
    ),
    Result.map((v): ChartTab => ({ ...v.ent, ...v.tabProps.props }))
  );
}
