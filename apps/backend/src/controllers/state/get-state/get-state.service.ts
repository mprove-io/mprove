import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import { getModelUrl } from '#backend/controllers/state/get-state/get-model-url/get-model-url';
import { branchesTable } from '#backend/drizzle/postgres/tables/branches';
import { bridgesTable } from '#backend/drizzle/postgres/tables/bridges';
import { chartsTable } from '#backend/drizzle/postgres/tables/charts';
import { membersTable } from '#backend/drizzle/postgres/tables/members';
import type { ModelTab } from '#backend/drizzle/postgres/tables/models';
import { modelsTable } from '#backend/drizzle/postgres/tables/models';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import { reportsTable } from '#backend/drizzle/postgres/tables/reports';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { checkAccess } from '#backend/functions/check-access/check-access';
import { checkModelAccess } from '#backend/functions/check-model-access/check-model-access';
import { getDashboardParts } from '#backend/functions/db/dashboards/get-dashboard-parts/get-dashboard-parts';
import { getEnvCheckExistsAndAccess } from '#backend/functions/db/envs/get-env-check-exists-and-access/get-env-check-exists-and-access';
import { memberTabToApi } from '#backend/functions/db/members/member-tab-to-api/member-tab-to-api';
import { getReportUrl } from '#backend/functions/db/reports/get-report-url/get-report-url';
import { getStructCheckExists } from '#backend/functions/db/structs/get-struct-check-exists/get-struct-check-exists';
import { getChartUrl } from '#backend/functions/get-chart-url/get-chart-url';
import { getDashboardUrl } from '#backend/functions/get-dashboard-url/get-dashboard-url';
import { projectTabToBaseProject } from '#backend/functions/project-tab-to-base-project/project-tab-to-base-project';
import { checkRepoId } from '#backend/functions/repos/check-repo-id/check-repo-id';
import { DbService } from '#backend/services/db/db.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import { getBuilderUrl } from '#common/functions/get-builder-url/get-builder-url';
import { mapBmlErrorsToMproveValidationErrors } from '#common/functions/map-bml-errors-to-mprove-validation-errors/map-bml-errors-to-mprove-validation-errors';
import type { GetStateError } from '#common/types/backend/function-errors/get-state-error';
import type { ToBackendGetStateOutput } from '#common/types/backend/routes/state/get-state/get-state-output';
import type { TimeSpec } from '#common/types/shared/time/timespec';

@Injectable()
export class GetStateService {
  constructor(
    private tabService: TabService,
    private cs: ConfigService<BackendConfig>,
    private rpcService: RpcService,
    private db: DbService
  ) {}

  async getState(item: {
    traceId: string;
    user: UserTab;
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    isFetch: boolean;
    getErrors: boolean;
    getRepo: boolean;
    getRepoNodes: boolean;
    getModels: boolean;
    getDashboards: boolean;
    getCharts: boolean;
    getMetrics: boolean;
    getReports: boolean;
  }): Result.ResultAsync<ToBackendGetStateOutput, GetStateError> {
    return Result.pipe(
      Result.succeed(item),
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
      Result.bind('diskGetCatalogNodesOutput', async v =>
        v.getRepo === true
          ? this.rpcService.sendToDisk({
              request: {
                operation: 'getCatalogNodes',
                traceId: v.traceId,
                input: {
                  baseProject: projectTabToBaseProject({
                    tabService: this.tabService,
                    project: v.project
                  }),
                  repoId: v.repoId,
                  branch: v.branchId,
                  isFetch: v.isFetch
                }
              }
            })
          : Result.succeed(undefined)
      ),
      Result.bind('struct', v =>
        getStructCheckExists({
          structId: v.bridge.structId,
          projectId: v.projectId,
          isGetEmptyStructOnError: true,
          cs: this.cs,
          db: this.db
        })
      ),
      Result.bind('allModels', v =>
        this.db.models.findMany({
          where: eq(modelsTable.structId, v.bridge.structId)
        })
      ),
      Result.bind('modelsWithAccess', v =>
        Result.succeed(
          v.allModels.filter(model =>
            checkModelAccess({
              member: v.userMember,
              modelAccessRoles: model.accessRolesCombined
            })
          )
        )
      ),
      Result.bind('charts', v =>
        this.db.charts.findMany({
          where: eq(chartsTable.structId, v.bridge.structId)
        })
      ),
      Result.bind('chartsGrantedAccess', v =>
        Result.succeed(
          v.charts.filter(chart => {
            let model: ModelTab = v.allModels.find(
              model => model.modelId === chart.modelId
            );

            return checkModelAccess({
              member: v.userMember,
              modelAccessRoles: model.accessRolesCombined
            });
          })
        )
      ),
      Result.bind('dashboardParts', v =>
        getDashboardParts({
          db: this.db,
          structId: v.bridge.structId,
          user: v.user,
          apiUserMember: memberTabToApi({
            member: v.userMember
          })
        })
      ),
      Result.bind('draftReports', v =>
        this.db.reports.findMany({
          where: and(
            eq(reportsTable.draft, true),
            eq(reportsTable.creatorId, v.user.userId),
            eq(reportsTable.structId, v.bridge.structId)
          )
        })
      ),
      Result.bind('structReports', v =>
        this.db.reports.findMany({
          where: and(
            eq(reportsTable.draft, false),
            eq(reportsTable.structId, v.bridge.structId)
          )
        })
      ),
      Result.bind('reportsGrantedAccess', v =>
        Result.succeed(
          v.structReports.filter(report =>
            checkAccess({
              member: v.userMember,
              accessRoles: report.accessRolesCombined,
              filePath: report.filePath
            })
          )
        )
      ),
      Result.bind('reports', v =>
        Result.succeed([
          ...v.draftReports
            .sort((a, b) =>
              a.draftCreatedTs > b.draftCreatedTs
                ? 1
                : b.draftCreatedTs > a.draftCreatedTs
                  ? -1
                  : 0
            )
            .reverse(),
          ...v.reportsGrantedAccess.sort((a, b) => {
            let aTitle: string =
              a.title.toLowerCase() || a.reportId.toLowerCase();

            let bTitle: string =
              b.title.toLowerCase() || a.reportId.toLowerCase();

            return aTitle > bTitle ? 1 : bTitle > aTitle ? -1 : 0;
          })
        ])
      ),
      Result.bind('hostUrl', v =>
        Result.succeed(
          this.cs.get<BackendConfig['hostUrl']>('hostUrl').split(',')[0]
        )
      ),
      Result.bind('defaultTimezone', v =>
        Result.succeed(v.struct.mproveConfig.defaultTimezone)
      ),
      Result.bind('builderUrl', v =>
        Result.succeed(
          getBuilderUrl({
            host: v.hostUrl,
            orgId: v.project.orgId,
            projectId: v.projectId,
            repoId: v.repoId,
            branch: v.branchId,
            env: v.envId
          })
        )
      ),
      Result.bind('repo', v => {
        if (v.getRepo === true && v.diskGetCatalogNodesOutput) {
          let diskRepo: ToBackendGetStateOutput['repo'] =
            v.diskGetCatalogNodesOutput.repo;

          delete diskRepo.changesToCommit;

          delete diskRepo.changesToPush;

          if (v.getRepoNodes === false) {
            delete diskRepo.nodes;
          }

          return Result.succeed(diskRepo);
        }

        return Result.succeed(undefined);
      }),
      Result.map(
        (v): ToBackendGetStateOutput => ({
          needValidate: v.bridge.needValidate,
          structId: v.struct.structId,
          validationErrorsTotal: v.struct.errors.length,
          modelsTotal: v.modelsWithAccess.length,
          chartsTotal: v.chartsGrantedAccess.length,
          dashboardsTotal: v.dashboardParts.length,
          reportsTotal: v.reports.length,
          builderUrl: v.builderUrl,
          validationErrors:
            v.getErrors === true
              ? mapBmlErrorsToMproveValidationErrors({
                  errors: v.struct.errors
                })
              : [],
          modelItems:
            v.getModels === true
              ? v.modelsWithAccess.map(model => ({
                  modelId: model.modelId,
                  url: getModelUrl({
                    host: v.hostUrl,
                    orgId: v.project.orgId,
                    projectId: v.projectId,
                    repoId: v.repoId,
                    branch: v.branchId,
                    env: v.envId,
                    modelId: model.modelId,
                    timezone: v.defaultTimezone
                  })
                }))
              : [],
          chartItems:
            v.getCharts === true
              ? v.chartsGrantedAccess.map(chart => ({
                  chartId: chart.chartId,
                  url: getChartUrl({
                    host: v.hostUrl,
                    orgId: v.project.orgId,
                    projectId: v.projectId,
                    repoId: v.repoId,
                    branch: v.branchId,
                    env: v.envId,
                    modelId: chart.modelId,
                    chartId: chart.chartId,
                    timezone: v.defaultTimezone
                  })
                }))
              : [],
          dashboardItems:
            v.getDashboards === true
              ? v.dashboardParts.map(dashboard => ({
                  dashboardId: dashboard.dashboardId,
                  url: getDashboardUrl({
                    host: v.hostUrl,
                    orgId: v.project.orgId,
                    projectId: v.projectId,
                    repoId: v.repoId,
                    branch: v.branchId,
                    env: v.envId,
                    dashboardId: dashboard.dashboardId,
                    timezone: v.defaultTimezone
                  })
                }))
              : [],
          reportItems:
            v.getReports === true
              ? v.reports.map(report => ({
                  reportId: report.reportId,
                  url: getReportUrl({
                    host: v.hostUrl,
                    orgId: v.project.orgId,
                    projectId: v.projectId,
                    repoId: v.repoId,
                    branch: v.branchId,
                    env: v.envId,
                    reportId: report.reportId,
                    timezone: v.defaultTimezone,
                    timeSpec: 'days' satisfies TimeSpec,
                    timeRange: 'f`last 5 days`'
                  })
                }))
              : [],
          metricItems:
            v.getMetrics === true
              ? v.struct.metrics.map(metric => ({
                  metricId: metric.metricId,
                  name: `${metric.partNodeLabel} ${metric.partFieldLabel} by ${metric.timeNodeLabel} ${metric.timeFieldLabel} - ${metric.topLabel}`
                }))
              : [],
          repo: v.repo
        })
      )
    );
  }
}
