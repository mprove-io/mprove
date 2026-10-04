import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackendConfig } from '#backend/config/backend-config';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  MemberTab,
  ModelTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { ServerError } from '#common/classes/server-error/server-error';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { MconfigParentType } from '#common/types/blockml/parts/mconfig/mconfig-parent-type';
import { ChartsService } from './db/charts.service';
import { DashboardsService } from './db/dashboards.service';
import { MconfigsService } from './db/mconfigs.service';
import { ModelsService } from './db/models.service';
import { ReportsService } from './db/reports.service';

@Injectable()
export class ParentService {
  constructor(
    private mconfigsService: MconfigsService,
    private chartsService: ChartsService,
    private dashboardsService: DashboardsService,
    private reportsService: ReportsService,
    private modelsService: ModelsService,
    private cs: ConfigService<BackendConfig>,
    @Inject(DRIZZLE) private db: Db
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
  }) {
    let {
      user,
      userMember,
      structId,
      projectId,
      parentType,
      parentId,
      modelId,
      isCheckSuggest,
      suggestFieldId,
      suggestRowId,
      suggestModel
    } = item;

    if (
      parentType === 'Dashboard' ||
      parentType === 'ChartDialogDashboard' ||
      parentType === 'SuggestDimensionDashboard'
    ) {
      let dashboard =
        await this.dashboardsService.getDashboardCheckExistsAndAccess({
          structId: structId,
          dashboardId: parentId,
          userMember: userMember,
          user: user
        });

      if (isCheckSuggest === true) {
        let field = dashboard.fields.find(
          field =>
            field.suggestModelDimension === `${modelId}.${suggestFieldId}`
        );

        if (isUndefined(field)) {
          throw new ServerError({
            message: 'BACKEND_SUGGEST_FIELD_NOT_FOUND'
          });
        }
      }
    } else if (
      parentType === 'Report' ||
      parentType === 'ChartDialogReport' ||
      parentType === 'SuggestDimensionReport'
    ) {
      let report = await this.reportsService.getReportCheckExistsAndAccess({
        projectId: projectId,
        structId: structId,
        reportId: parentId,
        userMember: userMember,
        user: user
      });

      if (isCheckSuggest === true) {
        if (isDefined(suggestRowId)) {
          let row = report.rows.find(x => x.rowId === suggestRowId);

          let rowParameters = row.parametersFiltersWithExcludedTime.map(x =>
            suggestModel.fields.find(y => y.id === x.fieldId)
          );

          let parameter = rowParameters.find(
            x => x.suggestModelDimension === `${modelId}.${suggestFieldId}`
          );

          if (isUndefined(parameter)) {
            throw new ServerError({
              message: 'BACKEND_SUGGEST_FIELD_NOT_FOUND'
            });
          }
        } else {
          let field = report.fields.find(
            field =>
              field.suggestModelDimension === `${modelId}.${suggestFieldId}`
          );

          if (isUndefined(field)) {
            throw new ServerError({
              message: 'BACKEND_SUGGEST_FIELD_NOT_FOUND'
            });
          }
        }
      }
    } else if (parentType === 'Chart') {
      let chart = await this.chartsService.getChartCheckExists({
        structId: structId,
        chartId: parentId,
        userMember: userMember,
        user: user
      });

      let model = await this.modelsService.getModelCheckExists({
        structId: structId,
        modelId: chart.modelId
      });

      this.chartsService.checkChartOrModelAccess({
        chart: chart,
        model: model,
        userMember: userMember
      });
    } else {
      await this.modelsService.getModelCheckExistsAndAccess({
        structId: structId,
        modelId: modelId,
        userMember: userMember
      });
    }
  }
}
