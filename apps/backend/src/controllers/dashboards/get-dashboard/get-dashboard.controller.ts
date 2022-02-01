import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
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

    let dashboardX = await this.dashboardsService.getDashboardX({
      user: user,
      member: member,
      dashboard: dashboard,
      branch: branch
    });

    let payload: apiToBackend.ToBackendGetDashboardResponsePayload = {
      dashboard: dashboardX
    };

    return payload;
  }
}
