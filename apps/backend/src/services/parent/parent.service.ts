import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import { BackendConfig } from '#backend/config/backend-config';
import type {
  ChartTab,
  DashboardTab,
  MemberTab,
  ModelTab,
  ReportTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { ChartsService } from '#backend/services/db/charts/charts.service';
import { DashboardsService } from '#backend/services/db/dashboards/dashboards.service';
import { DbService } from '#backend/services/db/db.service';
import { MconfigsService } from '#backend/services/db/mconfigs/mconfigs.service';
import { ModelsService } from '#backend/services/db/models/models.service';
import { ReportsService } from '#backend/services/db/reports/reports.service';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { CheckParentAccessError } from '#common/types/backend/function-errors/check-parent-access-error';
import type { DbModelsFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/models/db-models-find-first-check-exists-error';
import type { GetChartCheckExistsError } from '#common/types/backend/function-errors/get-chart-check-exists-error';
import type { GetDashboardCheckExistsAndAccessError } from '#common/types/backend/function-errors/get-dashboard-check-exists-and-access-error';
import type { GetReportCheckExistsAndAccessError } from '#common/types/backend/function-errors/get-report-check-exists-and-access-error';
import type { MconfigParentType } from '#common/types/blockml/parts/mconfig/mconfig-parent-type';

@Injectable()
export class ParentService {
  constructor(
    private mconfigsService: MconfigsService,
    private chartsService: ChartsService,
    private dashboardsService: DashboardsService,
    private reportsService: ReportsService,
    private modelsService: ModelsService,
    private cs: ConfigService<BackendConfig>,
    private db: DbService
  ) {}

  async checkParentAccess(item: {
    user: UserTab;
    userMember: MemberTab;
    structId: string;
    projectId: string;
    parentType: MconfigParentType;
    parentId: string;
    modelId?: string;
    isCheckSuggest?: boolean;
    suggestFieldId?: string;
    suggestRowId?: string;
    suggestModel?: ModelTab;
  }): Result.ResultAsync<void, CheckParentAccessError> {
    return Result.pipe(
      Result.succeed({
        ...item,
        isDashboard:
          item.parentType === 'Dashboard' ||
          item.parentType === 'ChartDialogDashboard' ||
          item.parentType === 'SuggestDimensionDashboard',
        isReport:
          item.parentType === 'Report' ||
          item.parentType === 'ChartDialogReport' ||
          item.parentType === 'SuggestDimensionReport'
      }),
      Result.bind(
        'dashboard',
        async (
          v
        ): Result.ResultAsync<
          DashboardTab,
          GetDashboardCheckExistsAndAccessError
        > =>
          v.isDashboard
            ? this.dashboardsService.getDashboardCheckExistsAndAccess({
                structId: v.structId,
                dashboardId: v.parentId,
                userMember: v.userMember,
                user: v.user
              })
            : Result.succeed(undefined)
      ),
      Result.andThrough(v => {
        if (v.isDashboard && v.isCheckSuggest === true) {
          if (
            v.dashboard.fields.findIndex(
              field =>
                field.suggestModelDimension ===
                `${v.modelId}.${v.suggestFieldId}`
            ) < 0
          ) {
            return Result.fail({ code: 'BACKEND_SUGGEST_FIELD_NOT_FOUND' });
          }
        }

        return Result.succeed();
      }),
      Result.bind(
        'report',
        async (
          v
        ): Result.ResultAsync<ReportTab, GetReportCheckExistsAndAccessError> =>
          v.isReport
            ? this.reportsService.getReportCheckExistsAndAccess({
                projectId: v.projectId,
                structId: v.structId,
                reportId: v.parentId,
                userMember: v.userMember,
                user: v.user
              })
            : Result.succeed(undefined)
      ),
      Result.andThrough(v => {
        if (v.isReport && v.isCheckSuggest === true) {
          if (isDefined(v.suggestRowId)) {
            let row: ReportTab['rows'][number] = v.report.rows.find(
              row => row.rowId === v.suggestRowId
            );

            let rowParameters: ModelTab['fields'] =
              row.parametersFiltersWithExcludedTime.map(filter =>
                v.suggestModel.fields.find(field => field.id === filter.fieldId)
              );

            if (
              rowParameters.findIndex(
                field =>
                  field.suggestModelDimension ===
                  `${v.modelId}.${v.suggestFieldId}`
              ) < 0
            ) {
              return Result.fail({ code: 'BACKEND_SUGGEST_FIELD_NOT_FOUND' });
            }
          } else if (
            v.report.fields.findIndex(
              field =>
                field.suggestModelDimension ===
                `${v.modelId}.${v.suggestFieldId}`
            ) < 0
          ) {
            return Result.fail({ code: 'BACKEND_SUGGEST_FIELD_NOT_FOUND' });
          }
        }

        return Result.succeed();
      }),
      Result.bind(
        'chart',
        async (v): Result.ResultAsync<ChartTab, GetChartCheckExistsError> =>
          v.parentType === 'Chart'
            ? this.chartsService.getChartCheckExists({
                structId: v.structId,
                chartId: v.parentId,
                userMember: v.userMember,
                user: v.user
              })
            : Result.succeed(undefined)
      ),
      Result.bind(
        'chartModel',
        async (
          v
        ): Result.ResultAsync<ModelTab, DbModelsFindFirstCheckExistsError> =>
          v.parentType === 'Chart'
            ? this.db.models.findFirstCheckExists({
                where: and(
                  eq(modelsTable.structId, v.structId),
                  eq(modelsTable.modelId, v.chart.modelId)
                )
              })
            : Result.succeed(undefined)
      ),
      Result.andThrough(v =>
        v.parentType === 'Chart'
          ? this.chartsService.checkChartOrModelAccess({
              chart: v.chart,
              model: v.chartModel,
              userMember: v.userMember
            })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        v.isDashboard || v.isReport || v.parentType === 'Chart'
          ? Result.succeed()
          : this.modelsService.getModelCheckExistsAndAccess({
              structId: v.structId,
              modelId: v.modelId,
              userMember: v.userMember
            })
      ),
      Result.map((v): void => undefined)
    );
  }
}
