import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { MemberTab } from '#backend/drizzle/postgres/schema/_tabs';
import { chartsTable } from '#backend/drizzle/postgres/schema/charts';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { checkModelAccess } from '#backend/functions/check-model-access';
import { TabService } from '#backend/services/tab.service';
import { ErEnum } from '#common/enums/er.enum';
import { QueryStatusEnum } from '#common/enums/query-status.enum';
import { getChartUrl } from '#common/functions/get-chart-url';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import { ServerError } from '#common/models/server-error';
import type { RunChart } from '#common/zod/backend/run/run-chart';
import type { RunQuery } from '#common/zod/backend/run/run-query';

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

@Injectable()
export class RunChartService {
  constructor(
    private tabService: TabService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async prepare(item: {
    structId: string;
    userMember: MemberTab;
    chartIds: string | undefined;
    hostUrl: string;
    orgId: string;
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    defaultTimezone: string;
  }) {
    let {
      structId,
      userMember,
      chartIds,
      hostUrl,
      orgId,
      projectId,
      repoId,
      branchId,
      envId,
      defaultTimezone
    } = item;

    let prepCharts: RunChartPrep[] = [];

    let mconfigParts: RunChartMconfigPart[] = [];

    let charts = await this.db.drizzle.query.chartsTable
      .findMany({
        where: eq(chartsTable.structId, structId)
      })
      .then(xs => xs.map(x => this.tabService.chartEntToTab(x)));

    let models = await this.db.drizzle.query.modelsTable
      .findMany({ where: eq(modelsTable.structId, structId) })
      .then(xs => xs.map(x => this.tabService.modelEntToTab(x)));

    let chartsGrantedAccess = charts.filter(x => {
      let model = models.find(y => y.modelId === x.modelId);

      return checkModelAccess({
        member: userMember,
        modelAccessRoles: model.accessRoles
      });
    });

    let chartIdsList = chartIds?.split(',');

    if (isDefined(chartIdsList)) {
      chartIdsList.forEach(chartId => {
        let isFound =
          chartsGrantedAccess.map(chart => chart.chartId).indexOf(chartId) > -1;

        if (isFound === false) {
          let serverError = new ServerError({
            message: ErEnum.BACKEND_CHART_NOT_FOUND,
            displayData: { id: chartId },
            originalError: null
          });
          throw serverError;
        }
      });
    }

    chartsGrantedAccess
      .filter(
        chart =>
          isUndefined(chartIdsList) || chartIdsList.indexOf(chart.chartId) > -1
      )
      .forEach(x => {
        let url = getChartUrl({
          host: hostUrl,
          orgId: orgId,
          projectId: projectId,
          repoId: repoId,
          branch: branchId,
          env: envId,
          modelId: x.modelId,
          chartId: x.chartId,
          timezone: defaultTimezone
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
  }

  build(item: {
    prepCharts: RunChartPrep[];
    findQuery: (item: { queryId: string }) => RunQuery;
  }): RunChart[] {
    let { prepCharts, findQuery } = item;

    return prepCharts.map(meta => ({
      title: meta.title,
      chartId: meta.chartId,
      url: meta.url,
      query: findQuery({ queryId: meta.queryId })
    }));
  }

  filterErrors(item: { charts: RunChart[] }): RunChart[] {
    let { charts } = item;

    return charts.filter(x => x.query.status === QueryStatusEnum.Error);
  }
}
