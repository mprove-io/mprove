import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import { getModelUrl } from '#backend/controllers/state/get-state/get-model-url/get-model-url';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  BranchTab,
  BridgeTab,
  ChartTab,
  MemberTab,
  ModelTab,
  ProjectTab,
  ReportTab,
  StructTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { chartsTable } from '#backend/drizzle/postgres/schema/charts';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { reportsTable } from '#backend/drizzle/postgres/schema/reports';
import { checkAccess } from '#backend/functions/check-access/check-access';
import { checkModelAccess } from '#backend/functions/check-model-access/check-model-access';
import { getChartUrl } from '#backend/functions/get-chart-url/get-chart-url';
import { getDashboardUrl } from '#backend/functions/get-dashboard-url/get-dashboard-url';
import { getReportUrl } from '#backend/functions/get-report-url/get-report-url';
import { BranchesService } from '#backend/services/db/branches/branches.service';
import { BridgesService } from '#backend/services/db/bridges/bridges.service';
import { DashboardsService } from '#backend/services/db/dashboards/dashboards.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { getBuilderUrl } from '#common/functions/get-builder-url/get-builder-url';
import { mapBmlErrorsToMproveValidationErrors } from '#common/functions/map-bml-errors-to-mprove-validation-errors/map-bml-errors-to-mprove-validation-errors';
import type { ChartEntToTabResultError } from '#common/types/backend/function-errors/chart-ent-to-tab-result-error';
import type { GetBranchCheckExistsResultError } from '#common/types/backend/function-errors/get-branch-check-exists-result-error';
import type { GetBridgeCheckExistsResultError } from '#common/types/backend/function-errors/get-bridge-check-exists-result-error';
import type { GetDashboardPartsResultError } from '#common/types/backend/function-errors/get-dashboard-parts-result-error';
import type { GetMemberCheckExistsResultError } from '#common/types/backend/function-errors/get-member-check-exists-result-error';
import type { GetProjectCheckExistsResultError } from '#common/types/backend/function-errors/get-project-check-exists-result-error';
import type { GetStateResultError } from '#common/types/backend/function-errors/get-state-result-error';
import type { GetStructCheckExistsResultError } from '#common/types/backend/function-errors/get-struct-check-exists-result-error';
import type { ModelEntToTabResultError } from '#common/types/backend/function-errors/model-ent-to-tab-result-error';
import type { ReportEntToTabResultError } from '#common/types/backend/function-errors/report-ent-to-tab-result-error';
import type { SendToDiskResultError } from '#common/types/backend/function-errors/send-to-disk-result-error';
import type { DashboardPart } from '#common/types/backend/parts/dashboard/dashboard-part';
import type { ToBackendGetStateOutput } from '#common/types/backend/routes/state/get-state/get-state-output';
import type { ToDiskGetCatalogNodesOutput } from '#common/types/disk/routes/catalogs/get-catalog-nodes/get-catalog-nodes-output';
import type { TimeSpec } from '#common/types/shared/time/timespec';

@Injectable()
export class GetStateService {
  constructor(
    private cs: ConfigService<BackendConfig>,
    private tabService: TabService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private rpcService: RpcService,
    private sessionsService: SessionsService,
    private structsService: StructsService,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private envsService: EnvsService,
    private dashboardsService: DashboardsService,
    @Inject(DRIZZLE) private db: Db
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
  }): Promise<ToBackendGetStateOutput> {
    let {
      traceId,
      user,
      projectId,
      repoId,
      branchId,
      envId,
      isFetch,
      getErrors,
      getRepo,
      getRepoNodes,
      getModels,
      getDashboards,
      getCharts,
      getMetrics,
      getReports
    } = item;

    let result: Result.Result<ToBackendGetStateOutput, GetStateResultError> =
      await this.getStateResult({
        traceId: traceId,
        user: user,
        projectId: projectId,
        repoId: repoId,
        branchId: branchId,
        envId: envId,
        isFetch: isFetch,
        getErrors: getErrors,
        getRepo: getRepo,
        getRepoNodes: getRepoNodes,
        getModels: getModels,
        getDashboards: getDashboards,
        getCharts: getCharts,
        getMetrics: getMetrics,
        getReports: getReports
      });

    if (Result.isFailure(result)) {
      throw new ServerError({
        message: result.error.code,
        displayData:
          'displayData' in result.error ? result.error.displayData : undefined,
        customData:
          result.error.code === 'BACKEND_RPC_TIMEOUT'
            ? { timeout: `${this.rpcService.rpcDiskTimeoutMs} ms` }
            : undefined,
        originalError:
          'originalError' in result.error && result.error.originalError
            ? Object.assign(new Error(result.error.originalError.code), {
                displayData:
                  'displayData' in result.error.originalError
                    ? result.error.originalError.displayData
                    : undefined
              })
            : undefined
      });
    }

    let payload: ToBackendGetStateOutput = result.value;

    return payload;
  }

  async getStateResult(item: {
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
  }): Result.ResultAsync<ToBackendGetStateOutput, GetStateResultError> {
    return Result.pipe(
      Result.succeed(item),
      Result.andThrough(v =>
        this.sessionsService.checkRepoIdResult({
          repoId: v.repoId,
          userId: v.user.userId,
          projectId: v.projectId,
          allowProdRepo: true
        })
      ),
      Result.bind(
        'project',
        (v): Result.ResultAsync<ProjectTab, GetProjectCheckExistsResultError> =>
          this.projectsService.getProjectCheckExistsResult({
            projectId: v.projectId
          })
      ),
      Result.bind(
        'userMember',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckExistsResultError> =>
          this.membersService.getMemberCheckExistsResult({
            projectId: v.projectId,
            memberId: v.user.userId
          })
      ),
      Result.bind(
        'branch',
        (v): Result.ResultAsync<BranchTab, GetBranchCheckExistsResultError> =>
          this.branchesService.getBranchCheckExistsResult({
            projectId: v.projectId,
            repoId: v.repoId,
            branchId: v.branchId
          })
      ),
      Result.andThrough(v =>
        this.envsService.getEnvCheckExistsAndAccessResult({
          projectId: v.projectId,
          envId: v.envId,
          member: v.userMember
        })
      ),
      Result.bind(
        'bridge',
        (v): Result.ResultAsync<BridgeTab, GetBridgeCheckExistsResultError> =>
          this.bridgesService.getBridgeCheckExistsResult({
            projectId: v.branch.projectId,
            repoId: v.branch.repoId,
            branchId: v.branch.branchId,
            envId: v.envId
          })
      ),
      Result.bind(
        'diskGetCatalogNodesOutput',
        async (
          v
        ): Result.ResultAsync<
          ToDiskGetCatalogNodesOutput,
          SendToDiskResultError
        > =>
          v.getRepo === true
            ? this.rpcService.sendToDiskResult({
                request: {
                  operation: 'getCatalogNodes',
                  traceId: v.traceId,
                  input: {
                    baseProject: this.tabService.projectTabToBaseProject({
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
      Result.bind(
        'struct',
        (v): Result.ResultAsync<StructTab, GetStructCheckExistsResultError> =>
          this.structsService.getStructCheckExistsResult({
            structId: v.bridge.structId,
            projectId: v.projectId,
            isGetEmptyStructOnError: true
          })
      ),
      Result.bind(
        'allModels',
        (v): Result.ResultAsync<ModelTab[], ModelEntToTabResultError> =>
          this.db.drizzle.query.modelsTable
            .findMany({ where: eq(modelsTable.structId, v.bridge.structId) })
            .then(modelEnts =>
              Result.sequence(modelEnts, modelEnt =>
                this.tabService.modelEntToTabResult({ modelEnt: modelEnt })
              )
            )
      ),
      Result.bind(
        'modelsWithAccess',
        (v): Result.Result<ModelTab[], never> =>
          Result.succeed(
            v.allModels.filter(model =>
              checkModelAccess({
                member: v.userMember,
                modelAccessRoles: model.accessRolesCombined
              })
            )
          )
      ),
      Result.bind(
        'charts',
        (v): Result.ResultAsync<ChartTab[], ChartEntToTabResultError> =>
          this.db.drizzle.query.chartsTable
            .findMany({ where: eq(chartsTable.structId, v.bridge.structId) })
            .then(chartEnts =>
              Result.sequence(chartEnts, chartEnt =>
                this.tabService.chartEntToTabResult({ chartEnt: chartEnt })
              )
            )
      ),
      Result.bind(
        'chartsGrantedAccess',
        (v): Result.Result<ChartTab[], never> =>
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
      Result.bind(
        'dashboardParts',
        (
          v
        ): Result.ResultAsync<DashboardPart[], GetDashboardPartsResultError> =>
          this.dashboardsService.getDashboardPartsResult({
            structId: v.bridge.structId,
            user: v.user,
            apiUserMember: this.membersService.tabToApi({
              member: v.userMember
            })
          })
      ),
      Result.bind(
        'draftReports',
        (v): Result.ResultAsync<ReportTab[], ReportEntToTabResultError> =>
          this.db.drizzle.query.reportsTable
            .findMany({
              where: and(
                eq(reportsTable.draft, true),
                eq(reportsTable.creatorId, v.user.userId),
                eq(reportsTable.structId, v.bridge.structId)
              )
            })
            .then(reportEnts =>
              Result.sequence(reportEnts, reportEnt =>
                this.tabService.reportEntToTabResult({ reportEnt: reportEnt })
              )
            )
      ),
      Result.bind(
        'structReports',
        (v): Result.ResultAsync<ReportTab[], ReportEntToTabResultError> =>
          this.db.drizzle.query.reportsTable
            .findMany({
              where: and(
                eq(reportsTable.draft, false),
                eq(reportsTable.structId, v.bridge.structId)
              )
            })
            .then(reportEnts =>
              Result.sequence(reportEnts, reportEnt =>
                this.tabService.reportEntToTabResult({ reportEnt: reportEnt })
              )
            )
      ),
      Result.bind(
        'reportsGrantedAccess',
        (v): Result.Result<ReportTab[], never> =>
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
      Result.bind(
        'reports',
        (v): Result.Result<ReportTab[], never> =>
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
      Result.bind(
        'hostUrl',
        (v): Result.Result<string, never> =>
          Result.succeed(
            this.cs.get<BackendConfig['hostUrl']>('hostUrl').split(',')[0]
          )
      ),
      Result.bind(
        'defaultTimezone',
        (v): Result.Result<string, never> =>
          Result.succeed(v.struct.mproveConfig.defaultTimezone)
      ),
      Result.bind(
        'builderUrl',
        (v): Result.Result<string, never> =>
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
      Result.bind(
        'repo',
        (v): Result.Result<ToBackendGetStateOutput['repo'], never> => {
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
        }
      ),
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
