import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BackendConfig } from '#backend/config/backend-config';
import type {
  BranchTab,
  BridgeTab,
  MemberTab,
  ProjectTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { getChartUrl } from '#backend/functions/get-chart-url/get-chart-url';
import { getDashboardUrl } from '#backend/functions/get-dashboard-url/get-dashboard-url';
import { getReportUrl } from '#backend/functions/get-report-url/get-report-url';
import { BranchesService } from '#backend/services/db/branches/branches.service';
import { BridgesService } from '#backend/services/db/bridges/bridges.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { QueryInfoChartService } from '#backend/services/query-info-chart/query-info-chart.service';
import { QueryInfoDashboardService } from '#backend/services/query-info-dashboard/query-info-dashboard.service';
import { QueryInfoReportService } from '#backend/services/query-info-report/query-info-report.service';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { GetBranchCheckExistsError } from '#common/types/backend/function-errors/get-branch-check-exists-error';
import type { GetBridgeCheckExistsError } from '#common/types/backend/function-errors/get-bridge-check-exists-error';
import type { GetChartDataError } from '#common/types/backend/function-errors/get-chart-data-error';
import type { GetDashboardDataError } from '#common/types/backend/function-errors/get-dashboard-data-error';
import type { GetMemberCheckExistsError } from '#common/types/backend/function-errors/get-member-check-exists-error';
import type { GetProjectCheckExistsError } from '#common/types/backend/function-errors/get-project-check-exists-error';
import type { GetQueryInfoError } from '#common/types/backend/function-errors/get-query-info-error';
import type { QueryInfoReportGetReportDataError } from '#common/types/backend/function-errors/query-info-report-get-report-data-error';
import type { QueryInfoChart } from '#common/types/backend/parts/query-info/query-info-chart';
import type { QueryInfoDashboard } from '#common/types/backend/parts/query-info/query-info-dashboard';
import type { QueryInfoQuery } from '#common/types/backend/parts/query-info/query-info-query';
import type { QueryInfoReport } from '#common/types/backend/parts/query-info/query-info-report';
import type { QueryInfoRow } from '#common/types/backend/parts/query-info/query-info-row';
import type { QueryInfoTile } from '#common/types/backend/parts/query-info/query-info-tile';
import type { ToBackendGetChartOutput } from '#common/types/backend/routes/charts/get-chart/get-chart-output';
import type { ToBackendGetDashboardOutput } from '#common/types/backend/routes/dashboards/get-dashboard/get-dashboard-output';
import type { ToBackendGetQueryInfoOutput } from '#common/types/backend/routes/query-info/get-query-info/get-query-info-output';
import type { ToBackendGetReportOutput } from '#common/types/backend/routes/reports/get-report/get-report-output';
import type { Mconfig } from '#common/types/blockml/parts/mconfig/mconfig';
import type { Query } from '#common/types/blockml/parts/query/query';
import type { TimeSpec } from '#common/types/shared/time/timespec';

@Injectable()
export class GetQueryInfoService {
  constructor(
    private cs: ConfigService<BackendConfig>,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private sessionsService: SessionsService,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private envsService: EnvsService,
    private queryInfoChartService: QueryInfoChartService,
    private queryInfoDashboardService: QueryInfoDashboardService,
    private queryInfoReportService: QueryInfoReportService
  ) {}

  async getQueryInfo(item: {
    traceId: string;
    user: UserTab;
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    chartId?: string;
    dashboardId?: string;
    tileIndex?: number;
    reportId?: string;
    rowId?: string;
    timezone: string;
    timeSpec?: TimeSpec;
    timeRangeFractionBrick?: string;
    getMalloy: boolean;
    getSql: boolean;
    getData: boolean;
    isFetch: boolean;
  }): Result.ResultAsync<ToBackendGetQueryInfoOutput, GetQueryInfoError> {
    return Result.pipe(
      Result.succeed(item),
      Result.andThrough(v =>
        isDefined(v.dashboardId) &&
        isDefined(v.chartId) &&
        isDefined(v.reportId)
          ? Result.fail({
              code: 'BACKEND_MUTUALLY_EXCLUSIVE_PARAMS',
              displayData: 'dashboardId, chartId, reportId'
            })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        isUndefined(v.dashboardId) &&
        isUndefined(v.chartId) &&
        isUndefined(v.reportId)
          ? Result.fail({
              code: 'BACKEND_DASHBOARD_ID_CHART_ID_AND_REPORT_ID_ARE_NOT_DEFINED'
            })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        isDefined(v.tileIndex) && isUndefined(v.dashboardId)
          ? Result.fail({
              code: 'BACKEND_TILE_INDEX_DOES_NOT_WORK_WITHOUT_DASHBOARD_ID'
            })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        isDefined(v.rowId) && isUndefined(v.reportId)
          ? Result.fail({
              code: 'BACKEND_ROW_ID_DOES_NOT_WORK_WITHOUT_REPORT_ID'
            })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        this.sessionsService.checkRepoId({
          repoId: v.repoId,
          userId: v.user.userId,
          projectId: v.projectId,
          allowProdRepo: true
        })
      ),
      Result.bind(
        'project',
        (v): Result.ResultAsync<ProjectTab, GetProjectCheckExistsError> =>
          this.projectsService.getProjectCheckExists({
            projectId: v.projectId
          })
      ),
      Result.bind(
        'userMember',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckExistsError> =>
          this.membersService.getMemberCheckExists({
            projectId: v.projectId,
            memberId: v.user.userId
          })
      ),
      Result.bind(
        'branch',
        (v): Result.ResultAsync<BranchTab, GetBranchCheckExistsError> =>
          this.branchesService.getBranchCheckExists({
            projectId: v.projectId,
            repoId: v.repoId,
            branchId: v.branchId
          })
      ),
      Result.andThrough(v =>
        this.envsService.getEnvCheckExistsAndAccess({
          projectId: v.projectId,
          envId: v.envId,
          member: v.userMember
        })
      ),
      Result.bind(
        'bridge',
        (v): Result.ResultAsync<BridgeTab, GetBridgeCheckExistsError> =>
          this.bridgesService.getBridgeCheckExists({
            projectId: v.branch.projectId,
            repoId: v.branch.repoId,
            branchId: v.branch.branchId,
            envId: v.envId
          })
      ),
      Result.bind(
        'hostUrl',
        (v): Result.Result<string, never> =>
          Result.succeed(
            this.cs.get<BackendConfig['hostUrl']>('hostUrl').split(',')[0]
          )
      ),
      Result.bind(
        'chartOutput',
        async (
          v
        ): Result.ResultAsync<ToBackendGetChartOutput, GetChartDataError> =>
          isUndefined(v.chartId)
            ? Result.succeed(undefined)
            : this.queryInfoChartService.getChartData({
                traceId: v.traceId,
                user: v.user,
                userMember: v.userMember,
                project: v.project,
                projectId: v.projectId,
                envId: v.envId,
                structId: v.bridge.structId,
                chartId: v.chartId,
                timezone: v.timezone,
                skipUi: true
              })
      ),
      Result.bind('chart', (v): Result.Result<QueryInfoChart, never> => {
        if (isUndefined(v.chartId)) {
          return Result.succeed(undefined);
        }

        let chart = v.chartOutput.chart;

        let tile = chart.tiles[0];

        let query: QueryInfoQuery = this.buildQueryInfoQuery({
          mconfig: tile.mconfig,
          query: tile.query,
          getMalloy: v.getMalloy,
          getSql: v.getSql,
          getData: v.getData
        });

        let url: string = getChartUrl({
          host: v.hostUrl,
          orgId: v.project.orgId,
          projectId: v.projectId,
          repoId: v.repoId,
          branch: v.branchId,
          env: v.envId,
          modelId: chart.modelId,
          chartId: chart.chartId,
          timezone: v.timezone
        });

        return Result.succeed({
          title: tile.mconfig.chart.title,
          chartId: chart.chartId,
          url: url,
          query: query
        });
      }),
      Result.bind(
        'dashboardOutput',
        async (
          v
        ): Result.ResultAsync<
          ToBackendGetDashboardOutput,
          GetDashboardDataError
        > =>
          isUndefined(v.dashboardId)
            ? Result.succeed(undefined)
            : this.queryInfoDashboardService.getDashboardData({
                traceId: v.traceId,
                user: v.user,
                userMember: v.userMember,
                project: v.project,
                bridge: v.bridge,
                projectId: v.projectId,
                repoId: v.repoId,
                envId: v.envId,
                dashboardId: v.dashboardId,
                timezone: v.timezone,
                skipUi: true
              })
      ),
      Result.bind(
        'dashboard',
        (v): Result.Result<QueryInfoDashboard, never> => {
          if (isUndefined(v.dashboardId)) {
            return Result.succeed(undefined);
          }

          let dashboard = v.dashboardOutput.dashboard;

          let tiles: QueryInfoTile[] = dashboard.tiles
            .filter((tile, i) => isUndefined(v.tileIndex) || i === v.tileIndex)
            .map(tile => ({
              title: tile.mconfig.chart.title,
              query: this.buildQueryInfoQuery({
                mconfig: tile.mconfig,
                query: tile.query,
                getMalloy: v.getMalloy,
                getSql: v.getSql,
                getData: v.getData
              })
            }));

          let url: string = getDashboardUrl({
            host: v.hostUrl,
            orgId: v.project.orgId,
            projectId: v.projectId,
            repoId: v.repoId,
            branch: v.branchId,
            env: v.envId,
            dashboardId: dashboard.dashboardId,
            timezone: v.timezone
          });

          return Result.succeed({
            title: dashboard.title,
            dashboardId: dashboard.dashboardId,
            url: url,
            tiles: tiles
          });
        }
      ),
      Result.bind(
        'reportOutput',
        async (
          v
        ): Result.ResultAsync<
          ToBackendGetReportOutput,
          QueryInfoReportGetReportDataError
        > =>
          isUndefined(v.reportId)
            ? Result.succeed(undefined)
            : this.queryInfoReportService.getReportData({
                traceId: v.traceId,
                user: v.user,
                userMember: v.userMember,
                project: v.project,
                bridge: v.bridge,
                projectId: v.projectId,
                envId: v.envId,
                reportId: v.reportId,
                timezone: v.timezone,
                timeSpec: v.timeSpec,
                timeRangeFractionBrick: v.timeRangeFractionBrick,
                skipUi: true
              })
      ),
      Result.bind('report', (v): Result.Result<QueryInfoReport, never> => {
        if (isUndefined(v.reportId)) {
          return Result.succeed(undefined);
        }

        let report = v.reportOutput.report;

        let rows: QueryInfoRow[] = report.rows
          .filter(row => isUndefined(v.rowId) || row.rowId === v.rowId)
          .map(row => ({
            rowId: row.rowId,
            name:
              row.rowType === 'metric'
                ? `${row.partNodeLabel} ${row.partFieldLabel} by ${row.timeNodeLabel} ${row.timeFieldLabel} - ${row.topLabel}`
                : row.name,
            rowType: row.rowType,
            metricId: row.metricId,
            formula: row.formula,
            parameters: row.parameters,
            query:
              row.rowType === 'metric'
                ? this.buildQueryInfoQuery({
                    mconfig: row.mconfig,
                    query: row.query,
                    getMalloy: v.getMalloy,
                    getSql: v.getSql,
                    getData: v.getData
                  })
                : undefined,
            records: v.getData === true ? row.records : undefined
          }));

        let url: string = getReportUrl({
          host: v.hostUrl,
          orgId: v.project.orgId,
          projectId: v.projectId,
          repoId: v.repoId,
          branch: v.branchId,
          env: v.envId,
          reportId: report.reportId,
          timezone: v.timezone,
          timeSpec: v.timeSpec,
          timeRange: v.timeRangeFractionBrick
        });

        return Result.succeed({
          title: report.title,
          reportId: report.reportId,
          url: url,
          rows: rows
        });
      }),
      Result.map(
        (v): ToBackendGetQueryInfoOutput => ({
          chart: v.chart,
          dashboard: v.dashboard,
          report: v.report
        })
      )
    );
  }

  private buildQueryInfoQuery(item: {
    mconfig: Mconfig;
    query: Query;
    getMalloy: boolean;
    getSql: boolean;
    getData: boolean;
  }): QueryInfoQuery {
    let { mconfig, query, getMalloy, getSql, getData } = item;

    let queryPart: QueryInfoQuery = {
      connectionId: query.connectionId,
      connectionType: query.connectionType,
      queryId: query.queryId,
      status: query.status,
      lastRunBy: query.lastRunBy,
      lastRunTs: query.lastRunTs,
      lastCancelTs: query.lastCancelTs,
      lastCompleteTs: query.lastCompleteTs,
      lastCompleteDuration: query.lastCompleteDuration,
      lastErrorMessage: query.lastErrorMessage,
      lastErrorTs: query.lastErrorTs,
      data: undefined,
      malloy: undefined,
      sql: undefined
    };

    if (getData) {
      queryPart.data = query.data;
    }

    if (getMalloy) {
      queryPart.malloy = mconfig?.malloyQueryExtra;
    }

    if (getSql) {
      queryPart.sql = query.sql;
    }

    return queryPart;
  }
}
