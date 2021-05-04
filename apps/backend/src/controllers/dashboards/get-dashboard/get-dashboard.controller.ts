import { Controller, Post } from '@nestjs/common';
import { In } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { BranchesService } from '~backend/services/branches.service';
import { DashboardsService } from '~backend/services/dashboards.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';

@Controller()
export class GetDashboardController {
  constructor(
    private branchesService: BranchesService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private queriesRepository: repositories.QueriesRepository,
    private mconfigsRepository: repositories.MconfigsRepository,
    private dashboardsService: DashboardsService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetDashboard)
  async getDashboard(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendGetDashboardRequest)
    reqValid: apiToBackend.ToBackendGetDashboardRequest
  ) {
    let { projectId, isRepoProd, branchId, dashboardId } = reqValid.payload;

    let repoId = isRepoProd === true ? common.PROD_REPO_ID : user.user_id;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let member = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.user_id
    });

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: repoId,
      branchId: branchId
    });

    let dashboard = await this.dashboardsService.getDashboardCheckExists({
      structId: branch.struct_id,
      dashboardId: dashboardId
    });

    let isAccessGranted = helper.checkAccess({
      userAlias: user.alias,
      memberRoles: member.roles,
      vmd: dashboard
    });

    if (isAccessGranted === false) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_FORBIDDEN_DASHBOARD
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

    let payload: apiToBackend.ToBackendGetDashboardResponsePayload = {
      dashboard: wrapper.wrapToApiDashboard(dashboard),
      dashboardMconfigs: mconfigs.map(x => wrapper.wrapToApiMconfig(x)),
      dashboardQueries: queries.map(x => wrapper.wrapToApiQuery(x))
    };

    return payload;
  }
}
