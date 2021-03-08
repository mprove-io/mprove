import { Controller, Post } from '@nestjs/common';
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
export class GetDashboardsListController {
  constructor(
    private branchesService: BranchesService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private dashboardsService: DashboardsService,
    private reposService: ReposService,
    private dashboardsRepository: repositories.DashboardsRepository
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetDashboardsList)
  async getDashboardsList(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendGetDashboardsListRequest)
    reqValid: apiToBackend.ToBackendGetDashboardsListRequest
  ) {
    let { projectId, repoId, branchId } = reqValid.payload;

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

    let dashboards = await this.dashboardsRepository.find({
      select: [
        'dashboard_id',
        'title',
        'gr',
        'hidden',
        'access_roles',
        'access_users'
      ],
      where: { struct_id: branch.struct_id }
    });

    let dashboardsGrantedAccess = dashboards.filter(x =>
      this.dashboardsService.checkDashboardAccess({
        userAlias: user.alias,
        memberRoles: member.roles,
        dashboard: x
      })
    );

    let payload: apiToBackend.ToBackendGetDashboardsListResponsePayload = {
      dashboardsList: dashboardsGrantedAccess.map(x =>
        wrapper.wrapToApiDashboardsItem(x)
      )
    };

    return payload;
  }
}
