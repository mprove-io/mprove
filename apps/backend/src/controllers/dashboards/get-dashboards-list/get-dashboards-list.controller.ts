import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { BranchesService } from '~backend/services/branches.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';

@Controller()
export class GetDashboardsListController {
  constructor(
    private branchesService: BranchesService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private dashboardsRepository: repositories.DashboardsRepository
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetDashboardsList)
  async getDashboardsList(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendGetDashboardsListRequest)
    reqValid: apiToBackend.ToBackendGetDashboardsListRequest
  ) {
    let { projectId, isRepoProd, branchId } = reqValid.payload;

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
      helper.checkAccess({
        userAlias: user.alias,
        member: member,
        vmd: x
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
