import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackendConfig } from '#backend/config/backend-config';
import { RunQueriesService } from '#backend/controllers/queries/run-queries/run-queries.service';
import { RunChartService } from '#backend/controllers/run/run/run-chart.service';
import { RunDashboardService } from '#backend/controllers/run/run/run-dashboard.service';
import { RunReportService } from '#backend/controllers/run/run/run-report.service';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { BranchesService } from '#backend/services/db/branches.service';
import { BridgesService } from '#backend/services/db/bridges.service';
import { EnvsService } from '#backend/services/db/envs.service';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { QueriesService } from '#backend/services/db/queries.service';
import { SessionsService } from '#backend/services/db/sessions.service';
import { StructsService } from '#backend/services/db/structs.service';
import { ErEnum } from '#common/enums/er.enum';
import { QueryStatusEnum } from '#common/enums/query-status.enum';
import { isDefined } from '#common/functions/is-defined';
import { sleep } from '#common/functions/sleep';
import type { RunChart } from '#common/interfaces/backend/run/run-chart';
import type { RunDashboard } from '#common/interfaces/backend/run/run-dashboard';
import type { RunQuery } from '#common/interfaces/backend/run/run-query';
import type { RunReport } from '#common/interfaces/backend/run/run-report';
import type { McliQueriesStats } from '#common/interfaces/mcli/mcli-queries-stats';
import type { ToBackendRunResponsePayload } from '#common/interfaces/to-backend/run/to-backend-run';
import { ServerError } from '#common/models/server-error';

@Injectable()
export class RunService {
  constructor(
    private cs: ConfigService<BackendConfig>,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private sessionsService: SessionsService,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private envsService: EnvsService,
    private structsService: StructsService,
    private queriesService: QueriesService,
    private runQueriesService: RunQueriesService,
    private runChartService: RunChartService,
    private runDashboardService: RunDashboardService,
    private runReportService: RunReportService
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
    reportIds?: string;
    noReports: boolean;
    getReports: boolean;
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
      getCharts,
      reportIds,
      noReports,
      getReports
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

    if (noReports === true && getReports === true) {
      let serverError = new ServerError({
        message: ErEnum.BACKEND_MUTUALLY_EXCLUSIVE_PARAMS,
        displayData: `noReports and getReports`,
        originalError: null
      });
      throw serverError;
    }

    if (noReports === true && isDefined(reportIds)) {
      let serverError = new ServerError({
        message: ErEnum.BACKEND_MUTUALLY_EXCLUSIVE_PARAMS,
        displayData: `noReports and reportIds`,
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

    let chartResult =
      noCharts === false
        ? await this.runChartService.prepare({
            structId: bridge.structId,
            userMember: userMember,
            chartIds: chartIds,
            hostUrl: hostUrl,
            orgId: orgId,
            projectId: projectId,
            repoId: repoId,
            branchId: branchId,
            envId: envId,
            defaultTimezone: defaultTimezone
          })
        : { prepCharts: [], mconfigParts: [] };

    let dashboardResult =
      noDashboards === false
        ? await this.runDashboardService.prepare({
            structId: bridge.structId,
            user: user,
            userMember: userMember,
            dashboardIds: dashboardIds,
            hostUrl: hostUrl,
            orgId: orgId,
            projectId: projectId,
            repoId: repoId,
            branchId: branchId,
            envId: envId,
            defaultTimezone: defaultTimezone
          })
        : { prepDashboards: [], mconfigParts: [] };

    let reportResult =
      noReports === false
        ? await this.runReportService.prepare({
            structId: bridge.structId,
            user: user,
            userMember: userMember,
            reportIds: reportIds,
            hostUrl: hostUrl,
            orgId: orgId,
            projectId: projectId,
            repoId: repoId,
            branchId: branchId,
            envId: envId,
            defaultTimezone: defaultTimezone
          })
        : { prepReports: [], mconfigParts: [] };

    let mconfigParts = [
      ...chartResult.mconfigParts,
      ...dashboardResult.mconfigParts,
      ...reportResult.mconfigParts
    ];

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

    let mconfigPartsToGet = [...mconfigParts];

    let waitQueries: RunQuery[] = [];

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

    let findQuery = (item: { queryId: string }): RunQuery => {
      let query = queriesForStats.find(q => q.queryId === item.queryId);
      if (isDefined(query)) {
        return {
          queryId: query.queryId,
          status: query.status,
          lastErrorMessage: query.lastErrorMessage
        };
      }
      return { queryId: item.queryId, status: QueryStatusEnum.New };
    };

    let chartParts: RunChart[] = this.runChartService.build({
      prepCharts: chartResult.prepCharts,
      findQuery: findQuery
    });

    let dashboardParts: RunDashboard[] = this.runDashboardService.build({
      prepDashboards: dashboardResult.prepDashboards,
      findQuery: findQuery
    });

    let reportParts: RunReport[] = this.runReportService.build({
      prepReports: reportResult.prepReports,
      findQuery: findQuery
    });

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

    let hasErrors = queriesStats.error > 0;

    let errorCharts: RunChart[] = hasErrors
      ? this.runChartService.filterErrors({ charts: chartParts })
      : [];

    let errorDashboards: RunDashboard[] = hasErrors
      ? this.runDashboardService.filterErrors({ dashboards: dashboardParts })
      : [];

    let errorReports: RunReport[] = hasErrors
      ? this.runReportService.filterErrors({ reports: reportParts })
      : [];

    let payload: ToBackendRunResponsePayload = {
      charts: getCharts === true ? chartParts : [],
      dashboards: getDashboards === true ? dashboardParts : [],
      reports: getReports === true ? reportParts : [],
      errorCharts: errorCharts,
      errorDashboards: errorDashboards,
      errorReports: errorReports,
      queriesStats: queriesStats
    };

    return payload;
  }
}
