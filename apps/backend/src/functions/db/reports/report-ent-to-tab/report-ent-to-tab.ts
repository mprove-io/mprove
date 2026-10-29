import { Result } from '@praha/byethrow';
import type {
  ReportEnt,
  ReportTab
} from '#backend/drizzle/postgres/tables/reports';
import { getTabProps } from '#backend/functions/get-tab-props/get-tab-props';
import type { TabService } from '#backend/services/tab/tab.service';
import type { ReportEntToTabError } from '#common/types/backend/function-errors/report-ent-to-tab-error';
import type { ReportLt } from '#common/types/shared/st-lt/reports/report-lt';
import type { ReportSt } from '#common/types/shared/st-lt/reports/report-st';

export function reportEntToTab(item: {
  ent: ReportEnt;
  tabService: TabService;
}): Result.Result<ReportTab, ReportEntToTabError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('tabProps', v =>
      getTabProps<ReportSt, ReportLt>({
        ent: v.ent,
        tabService: v.tabService
      })
    ),
    Result.map((v): ReportTab => ({ ...v.ent, ...v.tabProps.props }))
  );
}
