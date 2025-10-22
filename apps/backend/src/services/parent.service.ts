import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackendConfig } from '~backend/config/backend-config';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import {
  MconfigTab,
  MemberTab,
  UserTab
} from '~backend/drizzle/postgres/schema/_tabs';
import { MconfigParentTypeEnum } from '~common/enums/mconfig-parent-type.enum';
import { ChartsService } from './db/charts.service';
import { DashboardsService } from './db/dashboards.service';
import { ModelsService } from './db/models.service';
import { ReportsService } from './db/reports.service';

@Injectable()
export class ParentService {
  constructor(
    private chartsService: ChartsService,
    private dashboardsService: DashboardsService,
    private reportsService: ReportsService,
    private modelsService: ModelsService,
    private cs: ConfigService<BackendConfig>,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async checkAccess(item: {
    mconfig: MconfigTab;
    user: UserTab;
    userMember: MemberTab;
    structId: string;
    projectId: string;
  }) {
    let { mconfig, user, userMember, structId, projectId } = item;

    if (mconfig.parentType === MconfigParentTypeEnum.Chart) {
      await this.chartsService.getChartCheckExistsAndAccess({
        structId: structId,
        chartId: mconfig.parentId,
        userMember: userMember,
        user: user
      });
    } else if (
      mconfig.parentType === MconfigParentTypeEnum.Dashboard ||
      mconfig.parentType === MconfigParentTypeEnum.ChartDialogDashboard
    ) {
      await this.dashboardsService.getDashboardCheckExistsAndAccess({
        structId: structId,
        dashboardId: mconfig.parentId,
        userMember: userMember,
        user: user
      });
    } else if (
      mconfig.parentType === MconfigParentTypeEnum.Report ||
      mconfig.parentType === MconfigParentTypeEnum.ChartDialogReport
    ) {
      await this.reportsService.getReportCheckExistsAndAccess({
        projectId: projectId,
        structId: structId,
        reportId: mconfig.parentId,
        userMember: userMember,
        user: user
      });
      // } else if (mconfig.parentType === MconfigParentTypeEnum.SuggestDimension) {
      // } else if (mconfig.parentType === MconfigParentTypeEnum.Blank) {
    } else {
      await this.modelsService.getModelCheckExistsAndAccess({
        structId: structId,
        modelId: mconfig.modelId,
        userMember: userMember
      });
    }
  }
}
