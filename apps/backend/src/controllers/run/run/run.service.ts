import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import { RunQueriesService } from '#backend/controllers/queries/run-queries/run-queries.service';
import {
  type PrepareRunChartOutput,
  RunChartService
} from '#backend/controllers/run/run/run-chart.service';
import {
  type PrepareRunDashboardOutput,
  RunDashboardService
} from '#backend/controllers/run/run/run-dashboard.service';
import {
  type PrepareRunReportOutput,
  RunReportService
} from '#backend/controllers/run/run/run-report.service';
import { branchesTable } from '#backend/drizzle/postgres/tables/branches';
import { bridgesTable } from '#backend/drizzle/postgres/tables/bridges';
import { membersTable } from '#backend/drizzle/postgres/tables/members';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import type { QueryTab } from '#backend/drizzle/postgres/tables/queries';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { getEnvCheckExistsAndAccess } from '#backend/functions/db/envs/get-env-check-exists-and-access/get-env-check-exists-and-access';
import { getQueriesCheckExistSkipSqlData } from '#backend/functions/db/queries/get-queries-check-exist-skip-sql-data/get-queries-check-exist-skip-sql-data';
import { queryTabToApi } from '#backend/functions/db/queries/query-tab-to-api/query-tab-to-api';
import { checkRepoId } from '#backend/functions/db/sessions/check-repo-id/check-repo-id';
import { getStructCheckExists } from '#backend/functions/db/structs/get-struct-check-exists/get-struct-check-exists';
import { DbService } from '#backend/services/db/db.service';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { sleep } from '#common/functions/sleep/sleep';
import type { GetQueriesCheckExistSkipSqlDataError } from '#common/types/backend/function-errors/get-queries-check-exist-skip-sql-data-error';
import type { RunError } from '#common/types/backend/function-errors/run-error';
import type { RunChart } from '#common/types/backend/parts/run/run-chart';
import type { RunDashboard } from '#common/types/backend/parts/run/run-dashboard';
import type { RunQuery } from '#common/types/backend/parts/run/run-query';
import type { RunReport } from '#common/types/backend/parts/run/run-report';
import type { ToBackendRunOutput } from '#common/types/backend/routes/run/run/run-output';
import type { Query } from '#common/types/blockml/parts/query/query';
import type { McliQueriesStats } from '#common/types/mcli/mcli-queries-stats';

type RunMconfigPart = {
  mconfigId: string;
  queryId: string;
};

@Injectable()
export class RunService {
  constructor(
    private cs: ConfigService<BackendConfig>,
    private runQueriesService: RunQueriesService,
    private runChartService: RunChartService,
    private runDashboardService: RunDashboardService,
    private runReportService: RunReportService,
    private db: DbService
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
  }): Result.ResultAsync<ToBackendRunOutput, RunError> {
    return Result.pipe(
      Result.succeed({
        ...item,
        sleepSeconds: isDefined(item.sleep) ? item.sleep : 3
      }),
      Result.andThrough(v =>
        v.noDashboards === true && v.getDashboards === true
          ? Result.fail({
              code: 'BACKEND_MUTUALLY_EXCLUSIVE_PARAMS',
              displayData: 'noDashboards and getDashboards'
            })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        v.noDashboards === true && isDefined(v.dashboardIds)
          ? Result.fail({
              code: 'BACKEND_MUTUALLY_EXCLUSIVE_PARAMS',
              displayData: 'noDashboards and dashboardIds'
            })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        v.noCharts === true && v.getCharts === true
          ? Result.fail({
              code: 'BACKEND_MUTUALLY_EXCLUSIVE_PARAMS',
              displayData: 'noCharts and getCharts'
            })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        v.noCharts === true && isDefined(v.chartIds)
          ? Result.fail({
              code: 'BACKEND_MUTUALLY_EXCLUSIVE_PARAMS',
              displayData: 'noCharts and chartIds'
            })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        v.noReports === true && v.getReports === true
          ? Result.fail({
              code: 'BACKEND_MUTUALLY_EXCLUSIVE_PARAMS',
              displayData: 'noReports and getReports'
            })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        v.noReports === true && isDefined(v.reportIds)
          ? Result.fail({
              code: 'BACKEND_MUTUALLY_EXCLUSIVE_PARAMS',
              displayData: 'noReports and reportIds'
            })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        isDefined(v.sleep) && v.wait === false
          ? Result.fail({ code: 'BACKEND_SLEEP_DOES_NOT_WORK_WITHOUT_WAIT' })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        checkRepoId({
          repoId: v.repoId,
          userId: v.user.userId,
          projectId: v.projectId,
          allowProdRepo: true,
          db: this.db
        })
      ),
      Result.bind('project', v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.bind('userMember', v =>
        this.db.members.findFirstCheckExists({
          where: and(
            eq(membersTable.memberId, v.user.userId),
            eq(membersTable.projectId, v.projectId)
          )
        })
      ),
      Result.bind('branch', v =>
        this.db.branches.findFirstCheckExists({
          where: and(
            eq(branchesTable.projectId, v.projectId),
            eq(branchesTable.repoId, v.repoId),
            eq(branchesTable.branchId, v.branchId)
          )
        })
      ),
      Result.andThrough(v =>
        getEnvCheckExistsAndAccess({
          db: this.db,
          projectId: v.projectId,
          envId: v.envId,
          member: v.userMember
        })
      ),
      Result.bind('bridge', v =>
        this.db.bridges.findFirstCheckExists({
          where: and(
            eq(bridgesTable.projectId, v.branch.projectId),
            eq(bridgesTable.repoId, v.branch.repoId),
            eq(bridgesTable.branchId, v.branch.branchId),
            eq(bridgesTable.envId, v.envId)
          )
        })
      ),
      Result.bind('struct', v =>
        getStructCheckExists({
          structId: v.bridge.structId,
          projectId: v.projectId,
          cs: this.cs,
          db: this.db
        })
      ),
      Result.bind('hostUrl', v =>
        Result.succeed(
          this.cs.get<BackendConfig['hostUrl']>('hostUrl').split(',')[0]
        )
      ),
      Result.bind('prepareRunChartOutput', async v => {
        if (v.noCharts === false) {
          return this.runChartService.prepareRunChart({
            structId: v.bridge.structId,
            userMember: v.userMember,
            chartIds: v.chartIds,
            hostUrl: v.hostUrl,
            orgId: v.project.orgId,
            projectId: v.projectId,
            repoId: v.repoId,
            branchId: v.branchId,
            envId: v.envId,
            defaultTimezone: v.struct.mproveConfig.defaultTimezone
          });
        }

        let prepareRunChartOutput: PrepareRunChartOutput = {
          prepCharts: [],
          mconfigParts: []
        };

        return Result.succeed(prepareRunChartOutput);
      }),
      Result.bind('prepareRunDashboardOutput', async v => {
        if (v.noDashboards === false) {
          return this.runDashboardService.prepareRunDashboard({
            structId: v.bridge.structId,
            user: v.user,
            userMember: v.userMember,
            dashboardIds: v.dashboardIds,
            hostUrl: v.hostUrl,
            orgId: v.project.orgId,
            projectId: v.projectId,
            repoId: v.repoId,
            branchId: v.branchId,
            envId: v.envId,
            defaultTimezone: v.struct.mproveConfig.defaultTimezone
          });
        }

        let prepareRunDashboardOutput: PrepareRunDashboardOutput = {
          prepDashboards: [],
          mconfigParts: []
        };

        return Result.succeed(prepareRunDashboardOutput);
      }),
      Result.bind('prepareRunReportOutput', async v => {
        if (v.noReports === false) {
          return this.runReportService.prepareRunReport({
            structId: v.bridge.structId,
            user: v.user,
            userMember: v.userMember,
            reportIds: v.reportIds,
            hostUrl: v.hostUrl,
            orgId: v.project.orgId,
            projectId: v.projectId,
            repoId: v.repoId,
            branchId: v.branchId,
            envId: v.envId,
            defaultTimezone: v.struct.mproveConfig.defaultTimezone
          });
        }

        let prepareRunReportOutput: PrepareRunReportOutput = {
          prepReports: [],
          mconfigParts: []
        };

        return Result.succeed(prepareRunReportOutput);
      }),
      Result.bind('mconfigParts', v =>
        Result.succeed([
          ...v.prepareRunChartOutput.mconfigParts,
          ...v.prepareRunDashboardOutput.mconfigParts,
          ...v.prepareRunReportOutput.mconfigParts
        ])
      ),
      Result.bind('queriesStart', v =>
        getQueriesCheckExistSkipSqlData({
          queryIds: v.mconfigParts.map(x => x.queryId),
          projectId: v.projectId,
          db: this.db
        })
      ),
      Result.bind('apiQueriesStart', v =>
        Result.succeed(
          v.queriesStart.map(q =>
            queryTabToApi({
              query: q
            })
          )
        )
      ),
      Result.bind('runQueriesOutput', v =>
        this.runQueriesService.runQueries({
          user: v.user,
          projectId: v.projectId,
          repoId: v.repoId,
          branchId: v.branchId,
          envId: v.envId,
          mconfigIds: v.mconfigParts.map(x => x.mconfigId),
          poolSize: v.concurrency
        })
      ),
      Result.bind('waitQueries', async v => {
        let mconfigPartsToGet: RunMconfigPart[] = [...v.mconfigParts];

        let waitQueries: RunQuery[] = [];

        if (v.wait === true) {
          await sleep(v.sleepSeconds * 1000);

          while (mconfigPartsToGet.length > 0) {
            let queriesResult: Result.Result<
              QueryTab[],
              GetQueriesCheckExistSkipSqlDataError
            > = await getQueriesCheckExistSkipSqlData({
              queryIds: mconfigPartsToGet.map(x => x.queryId),
              projectId: v.projectId,
              db: this.db
            });

            if (Result.isFailure(queriesResult)) {
              return queriesResult;
            }

            let apiQueries: Query[] = queriesResult.value.map(q =>
              queryTabToApi({
                query: q
              })
            );

            apiQueries.forEach(query => {
              let queryStart: Query = v.apiQueriesStart.find(
                y => y.queryId === query.queryId
              );

              if (
                query.status !== 'Running' &&
                query.serverTs > queryStart.serverTs
              ) {
                waitQueries.push(query);

                mconfigPartsToGet = mconfigPartsToGet.filter(
                  x => x.queryId !== query.queryId
                );
              }
            });

            if (mconfigPartsToGet.length > 0) {
              await sleep(v.sleepSeconds * 1000);
            }
          }
        }

        return Result.succeed(waitQueries);
      }),
      Result.map((v): ToBackendRunOutput => {
        let queriesForStats: RunQuery[] =
          v.wait === true ? v.waitQueries : v.runQueriesOutput.runningQueries;

        let findQuery = (item: { queryId: string }): RunQuery => {
          let { queryId } = item;

          let query: RunQuery = queriesForStats.find(
            q => q.queryId === queryId
          );

          let output: RunQuery = isDefined(query)
            ? {
                queryId: query.queryId,
                status: query.status,
                lastErrorMessage: query.lastErrorMessage
              }
            : { queryId: queryId, status: 'New' };

          return output;
        };

        let chartParts: RunChart[] = this.runChartService.build({
          prepCharts: v.prepareRunChartOutput.prepCharts,
          findQuery: findQuery
        });

        let dashboardParts: RunDashboard[] = this.runDashboardService.build({
          prepDashboards: v.prepareRunDashboardOutput.prepDashboards,
          findQuery: findQuery
        });

        let reportParts: RunReport[] = this.runReportService.build({
          prepReports: v.prepareRunReportOutput.prepReports,
          findQuery: findQuery
        });

        let queriesStats: McliQueriesStats = {
          started:
            v.wait === true ? 0 : v.runQueriesOutput.startedQueryIds.length,
          running: queriesForStats.filter(q => q.status === 'Running').length,
          completed: queriesForStats.filter(q => q.status === 'Completed')
            .length,
          error: queriesForStats.filter(q => q.status === 'Error').length,
          canceled: queriesForStats.filter(q => q.status === 'Canceled').length
        };

        let isError: boolean = queriesStats.error > 0;

        return {
          charts: v.getCharts === true ? chartParts : [],
          dashboards: v.getDashboards === true ? dashboardParts : [],
          reports: v.getReports === true ? reportParts : [],
          errorCharts: isError
            ? this.runChartService.filterErrors({ charts: chartParts })
            : [],
          errorDashboards: isError
            ? this.runDashboardService.filterErrors({
                dashboards: dashboardParts
              })
            : [],
          errorReports: isError
            ? this.runReportService.filterErrors({ reports: reportParts })
            : [],
          queriesStats: queriesStats
        };
      })
    );
  }
}
