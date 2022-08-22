import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';

@Injectable()
export class DashboardsService {
  constructor(
    private dashboardsRepository: repositories.DashboardsRepository,
    private queriesRepository: repositories.QueriesRepository,
    private mconfigsRepository: repositories.MconfigsRepository,
    private modelsRepository: repositories.ModelsRepository
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
        message: common.ErEnum.BACKEND_DASHBOARD_DOES_NOT_EXIST
      });
    }

    return dashboard;
  }

  checkDashboardPath(item: { filePath: string; userAlias: string }) {
    if (item.filePath.split('/')[2] !== item.userAlias) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_FORBIDDEN_DASHBOARD_PATH
      });
    }
  }

  async getDashboardXCheckAccess(item: {
    dashboard: entities.DashboardEntity;
    member: entities.MemberEntity;
    user: entities.UserEntity;
    branch: entities.BranchEntity;
  }) {
    let { dashboard, member, user, branch } = item;

    let isAccessGranted = helper.checkAccess({
      userAlias: user.alias,
      member: member,
      vmd: dashboard
    });

    if (isAccessGranted === false) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_FORBIDDEN_DASHBOARD
      });
    }

    let mconfigIds = dashboard.reports.map(x => x.mconfigId);
    let mconfigs =
      mconfigIds.length === 0
        ? []
        : await this.mconfigsRepository.find({
            mconfig_id: In(mconfigIds)
          });

    let queryIds = dashboard.reports.map(x => x.queryId);
    let queries =
      queryIds.length === 0
        ? []
        : await this.queriesRepository.find({
            query_id: In(queryIds)
          });

    let models = await this.modelsRepository.find({
      struct_id: branch.struct_id
    });

    let apiModels = models.map(model =>
      wrapper.wrapToApiModel({
        model: model,
        hasAccess: helper.checkAccess({
          userAlias: user.alias,
          member: member,
          vmd: model
        })
      })
    );

    let dashboardX = wrapper.wrapToApiDashboard({
      dashboard: dashboard,
      mconfigs: mconfigs.map(x =>
        wrapper.wrapToApiMconfig({
          mconfig: x,
          modelFields: apiModels.find(m => m.modelId === x.model_id).fields
        })
      ),
      queries: queries.map(x => wrapper.wrapToApiQuery(x)),
      member: wrapper.wrapToApiMember(member),
      models: apiModels,
      isAddMconfigAndQuery: true
    });

    return dashboardX;
  }
}
