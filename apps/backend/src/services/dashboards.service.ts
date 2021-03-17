import { Injectable } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { repositories } from '~backend/barrels/repositories';

@Injectable()
export class DashboardsService {
  constructor(
    private dashboardsRepository: repositories.DashboardsRepository
  ) {}

  async getDashboardCheckExists(item: {
    dashboardId: string;
    structId: string;
  }) {
    let { dashboardId, structId } = item;

    let dashboard = await this.dashboardsRepository.findOne({
      struct_id: structId,
      dashboard_id: dashboardId
    });

    if (common.isUndefined(dashboard)) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_DASHBOARD_DOES_NOT_EXIST
      });
    }

    return dashboard;
  }

  checkDashboardPath(item: { filePath: string; userAlias: string }) {
    if (item.filePath.split('/')[2] !== item.userAlias) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_FORBIDDEN_DASHBOARD_PATH
      });
    }
  }
}
