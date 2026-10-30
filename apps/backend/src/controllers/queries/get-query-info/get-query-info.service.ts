import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import { branchesTable } from '#backend/drizzle/postgres/tables/branches';
import { bridgesTable } from '#backend/drizzle/postgres/tables/bridges';
import { membersTable } from '#backend/drizzle/postgres/tables/members';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { checkRepoId } from '#backend/functions/check-repo-id/check-repo-id';
import { getChartData } from '#backend/functions/db/charts/get-chart-data/get-chart-data';
import { getChartUrl } from '#backend/functions/db/charts/get-chart-url/get-chart-url';
import { getDashboardData } from '#backend/functions/db/dashboards/get-dashboard-data/get-dashboard-data';
import { getDashboardUrl } from '#backend/functions/db/dashboards/get-dashboard-url/get-dashboard-url';
import { getEnvCheckExistsAndAccess } from '#backend/functions/db/envs/get-env-check-exists-and-access/get-env-check-exists-and-access';
import { getQueryInfoReportData } from '#backend/functions/db/reports/get-query-info-report-data/get-query-info-report-data';
import { getReportUrl } from '#backend/functions/db/reports/get-report-url/get-report-url';
import { CalcDbService } from '#backend/services/calc-db/calc-db.service';
import { DbService } from '#backend/services/db/db.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { GetQueryInfoError } from '#common/types/backend/function-errors/get-query-info-error';
import type { QueryInfoChart } from '#common/types/backend/parts/query-info/query-info-chart';
import type { QueryInfoDashboard } from '#common/types/backend/parts/query-info/query-info-dashboard';
import type { QueryInfoQuery } from '#common/types/backend/parts/query-info/query-info-query';
import type { QueryInfoReport } from '#common/types/backend/parts/query-info/query-info-report';
import type { QueryInfoRow } from '#common/types/backend/parts/query-info/query-info-row';
import type { QueryInfoTile } from '#common/types/backend/parts/query-info/query-info-tile';
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
    private db: DbService,
    private logger: Logger,
    private tabService: TabService,
    private rpcService: RpcService,
    private calcDbService: CalcDbService
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
      Result.bind('hostUrl', v =>
        Result.succeed(
          this.cs.get<BackendConfig['hostUrl']>('hostUrl').split(',')[0]
        )
      ),
      Result.bind('chartOutput', async v =>
        isUndefined(v.chartId)
          ? Result.succeed(undefined)
          : getChartData({
              traceId: v.traceId,
              user: v.user,
              userMember: v.userMember,
              project: v.project,
              projectId: v.projectId,
              envId: v.envId,
              structId: v.bridge.structId,
              chartId: v.chartId,
              timezone: v.timezone,
              skipUi: true,
              db: this.db,
              cs: this.cs,
              logger: this.logger
            })
      ),
      Result.bind('chart', v => {
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

        let queryInfoChart: QueryInfoChart = {
          title: tile.mconfig.chart.title,
          chartId: chart.chartId,
          url: url,
          query: query
        };

        return Result.succeed(queryInfoChart);
      }),
      Result.bind('dashboardOutput', async v =>
        isUndefined(v.dashboardId)
          ? Result.succeed<ToBackendGetDashboardOutput>(undefined)
          : getDashboardData({
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
              skipUi: true,
              db: this.db,
              cs: this.cs,
              tabService: this.tabService,
              rpcService: this.rpcService,
              logger: this.logger
            })
      ),
      Result.bind('dashboard', v => {
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

        let queryInfoDashboard: QueryInfoDashboard = {
          title: dashboard.title,
          dashboardId: dashboard.dashboardId,
          url: url,
          tiles: tiles
        };

        return Result.succeed(queryInfoDashboard);
      }),
      Result.bind('reportOutput', async v =>
        isUndefined(v.reportId)
          ? Result.succeed<ToBackendGetReportOutput>(undefined)
          : getQueryInfoReportData({
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
              skipUi: true,
              db: this.db,
              cs: this.cs,
              calcDb: this.calcDbService.calcDb,
              logger: this.logger
            })
      ),
      Result.bind('report', v => {
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

        let queryInfoReport: QueryInfoReport = {
          title: report.title,
          reportId: report.reportId,
          url: url,
          rows: rows
        };

        return Result.succeed(queryInfoReport);
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
