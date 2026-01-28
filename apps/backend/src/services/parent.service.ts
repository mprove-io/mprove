import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ErEnum } from '#common/enums/er.enum';
import { MconfigParentTypeEnum } from '#common/enums/mconfig-parent-type.enum';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import { ServerError } from '#common/models/server-error';
import { BackendConfig } from '~backend/config/backend-config';
import { Db, DRIZZLE } from '~backend/drizzle/drizzle.module';
import {
  MemberTab,
  ModelTab,
  UserTab
} from '~backend/drizzle/postgres/schema/_tabs';
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

  async checkAccess(item: {
    user: UserTab;
    userMember: MemberTab;
    structId: string;
    projectId: string;
    parentType: MconfigParentTypeEnum;
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
      parentType === MconfigParentTypeEnum.Dashboard ||
      parentType === MconfigParentTypeEnum.ChartDialogDashboard ||
      parentType === MconfigParentTypeEnum.SuggestDimensionDashboard
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
            message: ErEnum.BACKEND_SUGGEST_FIELD_NOT_FOUND
          });
        }
      }
    } else if (
      parentType === MconfigParentTypeEnum.Report ||
      parentType === MconfigParentTypeEnum.ChartDialogReport ||
      parentType === MconfigParentTypeEnum.SuggestDimensionReport
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
              message: ErEnum.BACKEND_SUGGEST_FIELD_NOT_FOUND
            });
          }
        } else {
          let field = report.fields.find(
            field =>
              field.suggestModelDimension === `${modelId}.${suggestFieldId}`
          );

          if (isUndefined(field)) {
            throw new ServerError({
              message: ErEnum.BACKEND_SUGGEST_FIELD_NOT_FOUND
            });
          }
        }
      }
    } else {
      await this.modelsService.getModelCheckExistsAndAccess({
        structId: structId,
        modelId: modelId,
        userMember: userMember
      });
    }
  }
}
