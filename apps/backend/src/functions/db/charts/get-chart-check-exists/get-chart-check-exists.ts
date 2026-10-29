import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type { ChartTab } from '#backend/drizzle/postgres/tables/charts';
import { chartsTable } from '#backend/drizzle/postgres/tables/charts';
import type { MemberTab } from '#backend/drizzle/postgres/tables/members';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import type { DbService } from '#backend/services/db/db.service';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { GetChartCheckExistsError } from '#common/types/backend/function-errors/get-chart-check-exists-error';

export async function getChartCheckExists(item: {
  db: DbService;
  chartId: string;
  structId: string;
  userMember: MemberTab;
  user: UserTab;
}): Result.ResultAsync<ChartTab, GetChartCheckExistsError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('chart', v =>
      v.db.charts.findFirst({
        where: and(
          eq(chartsTable.structId, v.structId),
          eq(chartsTable.chartId, v.chartId)
        )
      })
    ),
    Result.andThrough(v =>
      isUndefined(v.chart)
        ? Result.fail({ code: 'BACKEND_CHART_DOES_NOT_EXIST' })
        : Result.succeed()
    ),
    Result.andThrough(v =>
      v.chart.draft === true && v.chart.creatorId !== v.user.userId
        ? Result.fail({ code: 'BACKEND_CHART_CREATOR_ID_MISMATCH' })
        : Result.succeed()
    ),
    Result.map((v): ChartTab => v.chart)
  );
}
