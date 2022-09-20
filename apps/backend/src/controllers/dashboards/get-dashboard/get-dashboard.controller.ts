import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { DashboardsService } from '~backend/services/dashboards.service';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';

@Controller()
export class GetDashboardController {
  constructor(
    private branchesService: BranchesService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private dashboardsService: DashboardsService,
    private bridgesService: BridgesService,
    private envsService: EnvsService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetDashboard)
  async getDashboard(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendGetDashboardRequest)
    reqValid: apiToBackend.ToBackendGetDashboardRequest
  ) {
    let {
      projectId,
      isRepoProd,
      branchId,
      envId,
      dashboardId
    } = reqValid.payload;

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

    let env = await this.envsService.getEnvCheckExists({
      projectId: projectId,
      envId: envId
    });

    let bridge = await this.bridgesService.getBridgeCheckExists({
      projectId: branch.project_id,
      repoId: branch.repo_id,
      branchId: branch.branch_id,
      envId: envId
    });

    let dashboard = await this.dashboardsService.getDashboardCheckExists({
      structId: bridge.struct_id,
      dashboardId: dashboardId
    });

    let dashboardX = await this.dashboardsService.getDashboardXCheckAccess({
      user: user,
      member: member,
      dashboard: dashboard,
      bridge: bridge
    });

    let payload: apiToBackend.ToBackendGetDashboardResponsePayload = {
      dashboard: dashboardX
    };

    return payload;
  }
}
