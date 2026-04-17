import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackendConfig } from '#backend/config/backend-config';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { BranchesService } from '#backend/services/db/branches.service';
import { BridgesService } from '#backend/services/db/bridges.service';
import { EnvsService } from '#backend/services/db/envs.service';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { SessionsService } from '#backend/services/db/sessions.service';
import { QueryInfoChartService } from '#backend/services/query-info-chart.service';
import { QueryInfoDashboardService } from '#backend/services/query-info-dashboard.service';
import { QueryInfoReportService } from '#backend/services/query-info-report.service';
import { ErEnum } from '#common/enums/er.enum';
import { RowTypeEnum } from '#common/enums/row-type.enum';
import { TimeSpecEnum } from '#common/enums/timespec.enum';
import { getChartUrl } from '#common/functions/get-chart-url';
import { getDashboardUrl } from '#common/functions/get-dashboard-url';
import { getReportUrl } from '#common/functions/get-report-url';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import { ServerError } from '#common/models/server-error';
import type { QueryInfoChart } from '#common/zod/backend/query-info/query-info-chart';
import type { QueryInfoDashboard } from '#common/zod/backend/query-info/query-info-dashboard';
import type { QueryInfoQuery } from '#common/zod/backend/query-info/query-info-query';
import type { QueryInfoReport } from '#common/zod/backend/query-info/query-info-report';
import type { QueryInfoRow } from '#common/zod/backend/query-info/query-info-row';
import type { QueryInfoTile } from '#common/zod/backend/query-info/query-info-tile';
import type { ToBackendGetQueryInfoResponsePayload } from '#common/zod/to-backend/query-info/to-backend-get-query-info';

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
    chartId: string;
    dashboardId: string;
    tileIndex: number;
    reportId: string;
    rowId: string;
    timezone: string;
    timeSpec: TimeSpecEnum;
    timeRangeFractionBrick: string;
    getMalloy: boolean;
    getSql: boolean;
    getData: boolean;
    isFetch: boolean;
  }): Promise<ToBackendGetQueryInfoResponsePayload> {
    let {
      traceId,
      user,
      projectId,
      repoId,
      branchId,
      envId,
      chartId,
      dashboardId,
      tileIndex,
      reportId,
      rowId,
      timezone,
      timeSpec,
      timeRangeFractionBrick,
      getMalloy,
      getSql,
      getData,
      isFetch
    } = item;

    if (isDefined(dashboardId) && isDefined(chartId) && isDefined(reportId)) {
      let serverError = new ServerError({
        message: ErEnum.BACKEND_MUTUALLY_EXCLUSIVE_PARAMS,
        displayData: `dashboardId, chartId, reportId`,
        originalError: null
      });
      throw serverError;
    }

    if (
      isUndefined(dashboardId) &&
      isUndefined(chartId) &&
      isUndefined(reportId)
    ) {
      let serverError = new ServerError({
        message:
          ErEnum.BACKEND_DASHBOARD_ID_CHART_ID_AND_REPORT_ID_ARE_NOT_DEFINED,
        originalError: null
      });
      throw serverError;
    }

    if (isDefined(tileIndex) && isUndefined(dashboardId)) {
      let serverError = new ServerError({
        message: ErEnum.BACKEND_TILE_INDEX_DOES_NOT_WORK_WITHOUT_DASHBOARD_ID,
        originalError: null
      });
      throw serverError;
    }

    if (isDefined(rowId) && isUndefined(reportId)) {
      let serverError = new ServerError({
        message: ErEnum.BACKEND_ROW_ID_DOES_NOT_WORK_WITHOUT_REPORT_ID,
        originalError: null
      });
      throw serverError;
    }

    let userId = user.userId;

    let repoType = await this.sessionsService.checkRepoId({
      repoId: repoId,
      userId: userId,
      projectId: projectId,
      allowProdRepo: true
    });

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: userId
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

    let hostUrl = this.cs
      .get<BackendConfig['hostUrl']>('hostUrl')
      .split(',')[0];

    let orgId = project.orgId;

    let payload: ToBackendGetQueryInfoResponsePayload = {
      chart: undefined,
      dashboard: undefined,
      report: undefined
    };

    if (isDefined(chartId)) {
      let chartResp = await this.queryInfoChartService.getChartData({
        traceId: traceId,
        user: user,
        userMember: userMember,
        project: project,
        projectId: projectId,
        envId: envId,
        structId: bridge.structId,
        chartId: chartId,
        timezone: timezone,
        skipUi: true
      });

      let chartX = chartResp.chart;
      let tileX = chartX.tiles[0];

      let queryPartQ = this.buildQueryInfoQuery({
        mconfig: tileX.mconfig,
        query: tileX.query,
        getMalloy: getMalloy,
        getSql: getSql,
        getData: getData
      });

      let url = getChartUrl({
        host: hostUrl,
        orgId: orgId,
        projectId: projectId,
        repoId: repoId,
        branch: branchId,
        env: envId,
        modelId: chartX.modelId,
        chartId: chartX.chartId,
        timezone: timezone
      });

      let chartPartQ: QueryInfoChart = {
        title: tileX.mconfig.chart.title,
        chartId: chartX.chartId,
        url: url,
        query: queryPartQ
      };

      payload.chart = chartPartQ;
    }

    if (isDefined(dashboardId)) {
      let dashboardResp = await this.queryInfoDashboardService.getDashboardData(
        {
          traceId: traceId,
          user: user,
          userMember: userMember,
          project: project,
          bridge: bridge,
          projectId: projectId,
          repoId: repoId,
          envId: envId,
          dashboardId: dashboardId,
          timezone: timezone,
          skipUi: true
        }
      );

      let dashboardX = dashboardResp.dashboard;

      let tilePartQs = dashboardX.tiles
        .filter((tile, i) => {
          if (isDefined(tileIndex)) {
            return i === tileIndex;
          }

          return true;
        })
        .map(tileX => {
          let queryPartQ = this.buildQueryInfoQuery({
            mconfig: tileX.mconfig,
            query: tileX.query,
            getMalloy: getMalloy,
            getSql: getSql,
            getData: getData
          });

          let tilePartQ: QueryInfoTile = {
            title: tileX.mconfig.chart.title,
            query: queryPartQ
          };

          return tilePartQ;
        });

      let url = getDashboardUrl({
        host: hostUrl,
        orgId: orgId,
        projectId: projectId,
        repoId: repoId,
        branch: branchId,
        env: envId,
        dashboardId: dashboardX.dashboardId,
        timezone: timezone
      });

      let dashboardPartQ: QueryInfoDashboard = {
        title: dashboardX.title,
        dashboardId: dashboardX.dashboardId,
        url: url,
        tiles: tilePartQs
      };

      payload.dashboard = dashboardPartQ;
    }

    if (isDefined(reportId)) {
      let reportResp = await this.queryInfoReportService.getReportData({
        traceId: traceId,
        user: user,
        userMember: userMember,
        project: project,
        bridge: bridge,
        projectId: projectId,
        envId: envId,
        reportId: reportId,
        timezone: timezone,
        timeSpec: timeSpec,
        timeRangeFractionBrick: timeRangeFractionBrick,
        skipUi: true
      });

      let reportX = reportResp.report;

      let rowPartQs: QueryInfoRow[] = reportX.rows
        .filter(row => {
          if (isDefined(rowId)) {
            return row.rowId === rowId;
          }

          return true;
        })
        .map(row => {
          let queryPartQ: QueryInfoQuery;

          if (row.rowType === RowTypeEnum.Metric) {
            queryPartQ = this.buildQueryInfoQuery({
              mconfig: row.mconfig,
              query: row.query,
              getMalloy: getMalloy,
              getSql: getSql,
              getData: getData
            });
          }

          let rowPartQ: QueryInfoRow = {
            rowId: row.rowId,
            name:
              row.rowType === RowTypeEnum.Metric
                ? `${row.partNodeLabel} ${row.partFieldLabel} by ${row.timeNodeLabel} ${row.timeFieldLabel} - ${row.topLabel}`
                : row.name,
            rowType: row.rowType,
            metricId: row.metricId,
            formula: row.formula,
            parameters: row.parameters,
            query: queryPartQ,
            records: getData === true ? row.records : undefined
          };

          return rowPartQ;
        });

      let url = getReportUrl({
        host: hostUrl,
        orgId: orgId,
        projectId: projectId,
        repoId: repoId,
        branch: branchId,
        env: envId,
        reportId: reportX.reportId,
        timezone: timezone,
        timeSpec: timeSpec,
        timeRange: timeRangeFractionBrick
      });

      let reportPartQ: QueryInfoReport = {
        title: reportX.title,
        reportId: reportX.reportId,
        url: url,
        rows: rowPartQs
      };

      payload.report = reportPartQ;
    }

    return payload;
  }

  private buildQueryInfoQuery(item: {
    mconfig: any;
    query: any;
    getMalloy: boolean;
    getSql: boolean;
    getData: boolean;
  }): QueryInfoQuery {
    let { mconfig, query, getMalloy, getSql, getData } = item;

    let queryPartQ: QueryInfoQuery = {
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
      queryPartQ.data = query.data;
    }

    if (getMalloy) {
      queryPartQ.malloy = mconfig?.malloyQueryExtra;
    }

    if (getSql) {
      queryPartQ.sql = query.sql;
    }

    return queryPartQ;
  }
}
