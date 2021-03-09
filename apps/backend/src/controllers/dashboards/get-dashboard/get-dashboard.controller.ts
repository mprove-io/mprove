import { Controller, Post } from '@nestjs/common';
import { In } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { BranchesService } from '~backend/services/branches.service';
import { DashboardsService } from '~backend/services/dashboards.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { ReposService } from '~backend/services/repos.service';

@Controller()
export class GetDashboardController {
  constructor(
    private branchesService: BranchesService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private queriesRepository: repositories.QueriesRepository,
    private mconfigsRepository: repositories.MconfigsRepository,
    private reposService: ReposService,
    private dashboardsService: DashboardsService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetDashboard)
  async getDashboard(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendGetDashboardRequest)
    reqValid: apiToBackend.ToBackendGetDashboardRequest
  ) {
    let { projectId, repoId, branchId, dashboardId } = reqValid.payload;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let member = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.user_id
    });

    if (repoId !== common.PROD_REPO_ID) {
      await this.reposService.checkDevRepoId({
        userId: user.user_id,
        repoId: repoId
      });
    }

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: repoId,
      branchId: branchId
    });

    let dashboard = await this.dashboardsService.getDashboardCheckExists({
      structId: branch.struct_id,
      dashboardId: dashboardId
    });

    let isAccessGranted = this.dashboardsService.checkDashboardAccess({
      userAlias: user.alias,
      memberRoles: member.roles,
      dashboard: dashboard
    });

    if (isAccessGranted === false) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_FORBIDDEN_DASHBOARD
      });
    }

    let mconfigIds = dashboard.reports.map(x => x.mconfigId);
    let mconfigs = await this.mconfigsRepository.find({
      mconfig_id: In(mconfigIds)
    });

    let queryIds = dashboard.reports.map(x => x.queryId);
    let queries = await this.queriesRepository.find({
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
