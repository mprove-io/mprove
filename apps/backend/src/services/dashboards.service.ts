import { Injectable } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
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

  checkDashboardAccess(item: {
    userAlias: string;
    memberRoles: string[];
    dashboard: entities.DashboardEntity;
  }): boolean {
    let { userAlias, memberRoles, dashboard } = item;

    if (
      dashboard.access_roles.length === 0 &&
      dashboard.access_users.length === 0
    ) {
      return true;
    }

    if (
      dashboard.access_users.indexOf(userAlias) < 0 &&
      !dashboard.access_roles.some(x => memberRoles.includes(x))
    ) {
      return false;
    }

    return true;
  }
}
