import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import { BackendConfig } from '#backend/config/backend-config';
import { RunQueriesService } from '#backend/controllers/queries/run-queries/run-queries.service';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { chartsTable } from '#backend/drizzle/postgres/schema/charts';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { checkModelAccess } from '#backend/functions/check-model-access';
import { BranchesService } from '#backend/services/db/branches.service';
import { BridgesService } from '#backend/services/db/bridges.service';
import { DashboardsService } from '#backend/services/db/dashboards.service';
import { EnvsService } from '#backend/services/db/envs.service';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { QueriesService } from '#backend/services/db/queries.service';
import { SessionsService } from '#backend/services/db/sessions.service';
import { StructsService } from '#backend/services/db/structs.service';
import { TabService } from '#backend/services/tab.service';
import { ErEnum } from '#common/enums/er.enum';
import { QueryStatusEnum } from '#common/enums/query-status.enum';
import { getChartUrl } from '#common/functions/get-chart-url';
import { getDashboardUrl } from '#common/functions/get-dashboard-url';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import { sleep } from '#common/functions/sleep';
import type { RunChart } from '#common/interfaces/backend/run/run-chart';
import type { RunDashboard } from '#common/interfaces/backend/run/run-dashboard';
import type { RunTile } from '#common/interfaces/backend/run/run-tile';
import type { Query } from '#common/interfaces/blockml/query';
import type { McliQueriesStats } from '#common/interfaces/mcli/mcli-queries-stats';
import type { ToBackendRunResponsePayload } from '#common/interfaces/to-backend/run/to-backend-run';
import { ServerError } from '#common/models/server-error';

@Injectable()
export class RunService {
  constructor(
    private cs: ConfigService<BackendConfig>,
    private tabService: TabService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private sessionsService: SessionsService,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private envsService: EnvsService,
    private structsService: StructsService,
    private dashboardsService: DashboardsService,
    private queriesService: QueriesService,
    private runQueriesService: RunQueriesService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async run(item: {
    traceId: string;
    user: UserTab;
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    concurrency?: number;
    wait: boolean;
    sleep?: number;
    dashboardIds?: string;
    chartIds?: string;
    noDashboards: boolean;
    noCharts: boolean;
    getDashboards: boolean;
    getCharts: boolean;
  }): Promise<ToBackendRunResponsePayload> {
    let {
      traceId,
      user,
      projectId,
      repoId,
      branchId,
      envId,
      concurrency,
      wait,
      dashboardIds,
      chartIds,
      noDashboards,
      noCharts,
      getDashboards,
      getCharts
    } = item;

    if (noDashboards === true && getDashboards === true) {
      let serverError = new ServerError({
        message: ErEnum.BACKEND_MUTUALLY_EXCLUSIVE_PARAMS,
        displayData: `noDashboards and getDashboards`,
        originalError: null
      });
      throw serverError;
    }

    if (noDashboards === true && isDefined(dashboardIds)) {
      let serverError = new ServerError({
        message: ErEnum.BACKEND_MUTUALLY_EXCLUSIVE_PARAMS,
        displayData: `noDashboards and dashboardIds`,
        originalError: null
      });
      throw serverError;
    }

    if (noCharts === true && getCharts === true) {
      let serverError = new ServerError({
        message: ErEnum.BACKEND_MUTUALLY_EXCLUSIVE_PARAMS,
        displayData: `noCharts and getCharts`,
        originalError: null
      });
      throw serverError;
    }

    if (noCharts === true && isDefined(chartIds)) {
      let serverError = new ServerError({
        message: ErEnum.BACKEND_MUTUALLY_EXCLUSIVE_PARAMS,
        displayData: `noCharts and chartIds`,
        originalError: null
      });
      throw serverError;
    }

    if (isDefined(item.sleep) && wait === false) {
      let serverError = new ServerError({
        message: ErEnum.BACKEND_SLEEP_DOES_NOT_WORK_WITHOUT_WAIT,
        originalError: null
      });
      throw serverError;
    }

    let sleepSeconds = isDefined(item.sleep) ? item.sleep : 3;

    await this.sessionsService.checkRepoId({
      repoId: repoId,
      userId: user.userId,
      projectId: projectId
    });

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: repoId,
      branchId: branchId
    });

    await this.envsService.getEnvCheckExistsAndAccess({
      projectId: projectId,
      envId: envId,
      member: userMember
    });

    let bridge = await this.bridgesService.getBridgeCheckExists({
      projectId: branch.projectId,
      repoId: branch.repoId,
      branchId: branch.branchId,
      envId: envId
    });

    let struct = await this.structsService.getStructCheckExists({
      structId: bridge.structId,
      projectId: projectId
    });

    let hostUrl = this.cs
      .get<BackendConfig['hostUrl']>('hostUrl')
      .split(',')[0];

    let orgId = project.orgId;
    let defaultTimezone = struct.mproveConfig.defaultTimezone;

    let mconfigParts: {
      mconfigId: string;
      queryId: string;
    }[] = [];

    let chartParts: RunChart[] = [];

    if (noCharts === false) {
      let charts = await this.db.drizzle.query.chartsTable
        .findMany({
          where: eq(chartsTable.structId, bridge.structId)
        })
        .then(xs => xs.map(x => this.tabService.chartEntToTab(x)));

      let models = await this.db.drizzle.query.modelsTable
        .findMany({ where: eq(modelsTable.structId, bridge.structId) })
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
            chartsGrantedAccess.map(chart => chart.chartId).indexOf(chartId) >
            -1;

          if (isFound === false) {
            let serverError = new ServerError({
              message: ErEnum.MCLI_CHART_NOT_FOUND,
              displayData: { id: chartId },
              originalError: null
            });
            throw serverError;
          }
        });
      }

      chartParts = chartsGrantedAccess
        .filter(
          chart =>
            isUndefined(chartIdsList) ||
            chartIdsList.indexOf(chart.chartId) > -1
        )
        .map(x => {
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

          let chartPart: RunChart = {
            title: x.title,
            chartId: x.chartId,
            url: url,
            query: { queryId: x.tiles[0].queryId } as Query
          };

          mconfigParts.push({
            mconfigId: x.tiles[0].mconfigId,
            queryId: x.tiles[0].queryId
          });

          return chartPart;
        });
    }

    let dashboardParts: RunDashboard[] = [];

    if (noDashboards === false) {
      let apiUserMember = this.membersService.tabToApi({
        member: userMember
      });

      let dashboards = await this.dashboardsService.getDashboardParts({
        structId: bridge.structId,
        user: user,
        apiUserMember: apiUserMember
      });

      let dashboardIdsList = dashboardIds?.split(',');

      if (isDefined(dashboardIdsList)) {
        dashboardIdsList.forEach(dashboardId => {
          let isFound =
            dashboards
              .map(dashboard => dashboard.dashboardId)
              .indexOf(dashboardId) > -1;

          if (isFound === false) {
            let serverError = new ServerError({
              message: ErEnum.MCLI_DASHBOARD_NOT_FOUND,
              displayData: { id: dashboardId },
              originalError: null
            });
            throw serverError;
          }
        });
      }

      dashboardParts = dashboards
        .filter(
          dashboard =>
            isUndefined(dashboardIdsList) ||
            dashboardIdsList.indexOf(dashboard.dashboardId) > -1
        )
        .map(dashboard => {
          let tileParts: RunTile[] = [];

          dashboard.tiles.forEach(tile => {
            let tilePart: RunTile = {
              title: tile.title,
              query: {
                queryId: tile.queryId
              } as Query
            };

            tileParts.push(tilePart);
            mconfigParts.push({
              mconfigId: tile.mconfigId,
              queryId: tile.queryId
            });
          });

          let url = getDashboardUrl({
            host: hostUrl,
            orgId: orgId,
            projectId: projectId,
            repoId: repoId,
            branch: branchId,
            env: envId,
            dashboardId: dashboard.dashboardId,
            timezone: defaultTimezone
          });

          let dashboardPart: RunDashboard = {
            title: dashboard.title,
            dashboardId: dashboard.dashboardId,
            url: url,
            tiles: tileParts
          };

          return dashboardPart;
        });
    }

    //
    let mconfigIds = mconfigParts.map(x => x.mconfigId);

    let queriesStart =
      await this.queriesService.getQueriesCheckExistSkipSqlData({
        queryIds: mconfigParts.map(x => x.queryId),
        projectId: projectId
      });

    let apiQueriesStart = queriesStart.map(q =>
      this.queriesService.tabToApi({ query: q })
    );
    //

    let runQueriesResp = await this.runQueriesService.runQueries({
      user: user,
      projectId: projectId,
      repoId: repoId,
      branchId: branchId,
      envId: envId,
      mconfigIds: mconfigIds,
      poolSize: concurrency
    });

    if (noCharts === false && isUndefined(concurrency)) {
      chartParts.forEach(v => {
        let query = runQueriesResp.runningQueries.find(
          q => q.queryId === v.query.queryId
        );
        v.query = query;
      });
    }

    if (noDashboards === false && isUndefined(concurrency)) {
      dashboardParts.forEach(dashboardPart => {
        dashboardPart.tiles.forEach(tilePart => {
          let query = runQueriesResp.runningQueries.find(
            q => q.queryId === tilePart.query.queryId
          );
          tilePart.query.status = query.status;
        });
      });
    }

    let mconfigPartsToGet = [...mconfigParts];

    let waitQueries: Query[] = [];

    if (wait === true) {
      await sleep(sleepSeconds * 1000);

      while (mconfigPartsToGet.length > 0) {
        let queries = await this.queriesService.getQueriesCheckExistSkipSqlData(
          {
            queryIds: mconfigPartsToGet.map(x => x.queryId),
            projectId: projectId
          }
        );

        let apiQueries = queries.map(q =>
          this.queriesService.tabToApi({ query: q })
        );

        apiQueries.forEach(query => {
          let queryStart = apiQueriesStart.find(
            y => y.queryId === query.queryId
          );

          if (
            query.status !== QueryStatusEnum.Running &&
            query.serverTs > queryStart.serverTs
          ) {
            waitQueries.push(query);

            if (noCharts === false) {
              chartParts
                .filter(chartPart => chartPart.query.queryId === query.queryId)
                .forEach(x => (x.query = query));
            }

            if (noDashboards === false) {
              dashboardParts.forEach(dp => {
                dp.tiles
                  .filter(tilePart => tilePart.query.queryId === query.queryId)
                  .forEach(x => (x.query = query));
              });
            }

            mconfigPartsToGet = mconfigPartsToGet.filter(
              x => x.queryId !== query.queryId
            );
          }
        });

        if (mconfigPartsToGet.length > 0) {
          await sleep(sleepSeconds * 1000);
        }
      }
    }

    let queriesForStats =
      wait === true ? waitQueries : runQueriesResp.runningQueries;

    let queriesStats: McliQueriesStats = {
      started: wait === true ? 0 : runQueriesResp.startedQueryIds.length,
      running: queriesForStats.filter(q => q.status === QueryStatusEnum.Running)
        .length,
      completed: queriesForStats.filter(
        q => q.status === QueryStatusEnum.Completed
      ).length,
      error: queriesForStats.filter(q => q.status === QueryStatusEnum.Error)
        .length,
      canceled: queriesForStats.filter(
        q => q.status === QueryStatusEnum.Canceled
      ).length
    };

    let errorCharts: RunChart[] =
      queriesStats.error === 0
        ? []
        : chartParts
            .filter(x => x.query.status === QueryStatusEnum.Error)
            .map(v => ({
              title: v.title,
              chartId: v.chartId,
              url: v.url,
              query: {
                lastErrorMessage: v.query.lastErrorMessage,
                status: v.query.status,
                queryId: v.query.queryId
              } as Query
            }));

    let errorDashboards: RunDashboard[] =
      queriesStats.error === 0
        ? []
        : dashboardParts
            .filter(
              x =>
                x.tiles.filter(y => y.query.status === QueryStatusEnum.Error)
                  .length > 0
            )
            .map(d => ({
              title: d.title,
              dashboardId: d.dashboardId,
              url: d.url,
              tiles: d.tiles
                .filter(q => q.query.status === QueryStatusEnum.Error)
                .map(r => ({
                  title: r.title,
                  query: {
                    lastErrorMessage: r.query.lastErrorMessage,
                    status: r.query.status,
                    queryId: r.query.queryId
                  } as Query
                }))
            }));

    let payload: ToBackendRunResponsePayload = {
      charts: getCharts === true ? chartParts : [],
      dashboards: getDashboards === true ? dashboardParts : [],
      errorCharts: errorCharts,
      errorDashboards: errorDashboards,
      queriesStats: queriesStats
    };

    return payload;
  }
}
