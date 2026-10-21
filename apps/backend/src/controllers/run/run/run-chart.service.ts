import { Injectable } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import type {
  MemberTab,
  ModelTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { chartsTable } from '#backend/drizzle/postgres/schema/charts';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { checkModelAccess } from '#backend/functions/check-model-access/check-model-access';
import { getChartUrl } from '#backend/functions/get-chart-url/get-chart-url';
import { DbService } from '#backend/services/db/db.service';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { PrepareRunChartError } from '#common/types/backend/function-errors/prepare-run-chart-error';
import type { RunChart } from '#common/types/backend/parts/run/run-chart';
import type { RunQuery } from '#common/types/backend/parts/run/run-query';

interface RunChartPrep {
  title: string;
  chartId: string;
  url: string;
  queryId: string;
}

interface RunChartMconfigPart {
  mconfigId: string;
  queryId: string;
}

export type PrepareRunChartOutput = {
  prepCharts: RunChartPrep[];
  mconfigParts: RunChartMconfigPart[];
};

@Injectable()
export class RunChartService {
  constructor(private db: DbService) {}

  async prepareRunChart(item: {
    structId: string;
    userMember: MemberTab;
    chartIds?: string;
    hostUrl: string;
    orgId: string;
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    defaultTimezone: string;
  }): Result.ResultAsync<PrepareRunChartOutput, PrepareRunChartError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind('charts', v =>
        this.db.charts.findMany({
          where: eq(chartsTable.structId, v.structId)
        })
      ),
      Result.bind('models', v =>
        this.db.models.findMany({
          where: eq(modelsTable.structId, v.structId)
        })
      ),
      Result.bind('chartsGrantedAccess', v =>
        Result.succeed(
          v.charts.filter(x => {
            let model: ModelTab = v.models.find(y => y.modelId === x.modelId);

            return checkModelAccess({
              member: v.userMember,
              modelAccessRoles: model.accessRolesCombined
            });
          })
        )
      ),
      Result.bind('chartIdsList', v => Result.succeed(v.chartIds?.split(','))),
      Result.andThrough(v =>
        isUndefined(v.chartIdsList)
          ? Result.succeed()
          : Result.sequence(v.chartIdsList, chartId =>
              v.chartsGrantedAccess.some(chart => chart.chartId === chartId)
                ? Result.succeed()
                : Result.fail({
                    code: 'BACKEND_CHART_NOT_FOUND',
                    displayData: { id: chartId }
                  })
            )
      ),
      Result.map((v): PrepareRunChartOutput => {
        let prepCharts: RunChartPrep[] = [];

        let mconfigParts: RunChartMconfigPart[] = [];

        v.chartsGrantedAccess
          .filter(
            chart =>
              isUndefined(v.chartIdsList) ||
              v.chartIdsList.includes(chart.chartId)
          )
          .forEach(x => {
            let url: string = getChartUrl({
              host: v.hostUrl,
              orgId: v.orgId,
              projectId: v.projectId,
              repoId: v.repoId,
              branch: v.branchId,
              env: v.envId,
              modelId: x.modelId,
              chartId: x.chartId,
              timezone: v.defaultTimezone
            });

            prepCharts.push({
              title: x.title,
              chartId: x.chartId,
              url: url,
              queryId: x.tiles[0].queryId
            });

            mconfigParts.push({
              mconfigId: x.tiles[0].mconfigId,
              queryId: x.tiles[0].queryId
            });
          });

        return { prepCharts: prepCharts, mconfigParts: mconfigParts };
      })
    );
  }

  build(item: {
    prepCharts: RunChartPrep[];
    findQuery: (item: { queryId: string }) => RunQuery;
  }): RunChart[] {
    let { prepCharts, findQuery } = item;

    let charts: RunChart[] = prepCharts.map(meta => ({
      title: meta.title,
      chartId: meta.chartId,
      url: meta.url,
      query: findQuery({ queryId: meta.queryId })
    }));

    return charts;
  }

  filterErrors(item: { charts: RunChart[] }): RunChart[] {
    let { charts } = item;

    let errorCharts: RunChart[] = charts.filter(
      x => x.query.status === 'Error'
    );

    return errorCharts;
  }
}
