import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { AttachUser } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { DashboardsService } from '~backend/services/dashboards.service';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { StructsService } from '~backend/services/structs.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class GetDashboardTileController {
  constructor(
    private branchesService: BranchesService,
    private membersService: MembersService,
    private structsService: StructsService,
    private dashboardsService: DashboardsService,
    private projectsService: ProjectsService,
    private bridgesService: BridgesService,
    private envsService: EnvsService,
    private wrapToApiService: WrapToApiService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetDashboardTile)
  async getDashboardTile(
    @AttachUser() user: schemaPostgres.UserEnt,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendGetDashboardTileRequest = request.body;

    let { projectId, isRepoProd, branchId, envId, dashboardId, mconfigId } =
      reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: isRepoProd === true ? common.PROD_REPO_ID : user.userId,
      branchId: branchId
    });

    await this.envsService.getEnvCheckExistsAndAccess({
      projectId: projectId,
      envId: envId,
      member: userMember
    });

    let bridge = await this.bridgesService.getBridgeCheckExists({
      projectId: branch.projectId,
      repoId: branch.repoId,
      branchId: branch.branchId,
      envId: envId
    });

    await this.structsService.getStructCheckExists({
      structId: bridge.structId,
      projectId: projectId
    });

    let dashboard = await this.dashboardsService.getDashboardCheckExists({
      structId: bridge.structId,
      dashboardId: dashboardId
    });

    let dashboardX = await this.dashboardsService.getDashboardXCheckAccess({
      user: user,
      member: userMember,
      dashboard: dashboard,
      bridge: bridge,
      projectId: projectId
    });

    if (dashboard.tiles.map(tile => tile.mconfigId).indexOf(mconfigId) < 0) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_TILE_MCONFIG_ID_MISMATCH
      });
    }

    let apiMember = this.wrapToApiService.wrapToApiMember(userMember);

    let payload: apiToBackend.ToBackendGetDashboardTileResponsePayload = {
      userMember: apiMember,
      tile: dashboardX.tiles.find(tile => tile.mconfigId === mconfigId)
    };

    return payload;
  }
}
