import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type { ChartTab } from '#backend/drizzle/postgres/tables/charts';
import type { DashboardTab } from '#backend/drizzle/postgres/tables/dashboards';
import type { MemberTab } from '#backend/drizzle/postgres/tables/members';
import type { ModelTab } from '#backend/drizzle/postgres/tables/models';
import { modelsTable } from '#backend/drizzle/postgres/tables/models';
import type { ReportTab } from '#backend/drizzle/postgres/tables/reports';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { checkChartOrModelAccess } from '#backend/functions/db/charts/check-chart-or-model-access/check-chart-or-model-access';
import { getChartCheckExists } from '#backend/functions/db/charts/get-chart-check-exists/get-chart-check-exists';
import { getDashboardCheckExistsAndAccess } from '#backend/functions/db/dashboards/get-dashboard-check-exists-and-access/get-dashboard-check-exists-and-access';
import { getModelCheckExistsAndAccess } from '#backend/functions/db/models/get-model-check-exists-and-access/get-model-check-exists-and-access';
import { getReportCheckExistsAndAccess } from '#backend/functions/db/reports/get-report-check-exists-and-access/get-report-check-exists-and-access';
import type { DbService } from '#backend/services/db/db.service';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { CheckParentMemberAccessError } from '#common/types/backend/function-errors/check-parent-member-access-error';
import type { MconfigParentType } from '#common/types/blockml/parts/mconfig/mconfig-parent-type';

export async function checkParentMemberAccess(item: {
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
  db: DbService;
}): Result.ResultAsync<void, CheckParentMemberAccessError> {
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
    Result.bind('dashboard', async v =>
      v.isDashboard
        ? getDashboardCheckExistsAndAccess({
            db: v.db,
            structId: v.structId,
            dashboardId: v.parentId,
            userMember: v.userMember,
            user: v.user
          })
        : Result.succeed<DashboardTab>(undefined)
    ),
    Result.andThrough(v => {
      if (v.isDashboard && v.isCheckSuggest === true) {
        if (
          v.dashboard.fields.findIndex(
            field =>
              field.suggestModelDimension === `${v.modelId}.${v.suggestFieldId}`
          ) < 0
        ) {
          return Result.fail({ code: 'BACKEND_SUGGEST_FIELD_NOT_FOUND' });
        }
      }

      return Result.succeed();
    }),
    Result.bind('report', async v =>
      v.isReport
        ? getReportCheckExistsAndAccess({
            projectId: v.projectId,
            structId: v.structId,
            reportId: v.parentId,
            userMember: v.userMember,
            user: v.user,
            db: v.db
          })
        : Result.succeed<ReportTab>(undefined)
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
              field.suggestModelDimension === `${v.modelId}.${v.suggestFieldId}`
          ) < 0
        ) {
          return Result.fail({ code: 'BACKEND_SUGGEST_FIELD_NOT_FOUND' });
        }
      }

      return Result.succeed();
    }),
    Result.bind('chart', async v =>
      v.parentType === 'Chart'
        ? getChartCheckExists({
            db: v.db,
            structId: v.structId,
            chartId: v.parentId,
            userMember: v.userMember,
            user: v.user
          })
        : Result.succeed<ChartTab>(undefined)
    ),
    Result.bind('chartModel', async v =>
      v.parentType === 'Chart'
        ? v.db.models.findFirstCheckExists({
            where: and(
              eq(modelsTable.structId, v.structId),
              eq(modelsTable.modelId, v.chart.modelId)
            )
          })
        : Result.succeed(undefined)
    ),
    Result.andThrough(v =>
      v.parentType === 'Chart'
        ? checkChartOrModelAccess({
            chart: v.chart,
            model: v.chartModel,
            userMember: v.userMember
          })
        : Result.succeed()
    ),
    Result.andThrough(v =>
      v.isDashboard || v.isReport || v.parentType === 'Chart'
        ? Result.succeed()
        : getModelCheckExistsAndAccess({
            structId: v.structId,
            modelId: v.modelId,
            userMember: v.userMember,
            db: v.db
          })
    ),
    Result.map((v): void => undefined)
  );
}
