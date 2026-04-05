import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { BranchesService } from '#backend/services/db/branches.service';
import { BridgesService } from '#backend/services/db/bridges.service';
import { EnvsService } from '#backend/services/db/envs.service';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { SessionsService } from '#backend/services/db/sessions.service';
import { QueryInfoDashboardService } from '#backend/services/query-info-dashboard.service';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type {
  ToBackendGetDashboardRequest,
  ToBackendGetDashboardResponsePayload
} from '#common/interfaces/to-backend/dashboards/to-backend-get-dashboard';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Controller()
export class GetDashboardController {
  constructor(
    private membersService: MembersService,
    private sessionsService: SessionsService,
    private projectsService: ProjectsService,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private envsService: EnvsService,
    private queryInfoDashboardService: QueryInfoDashboardService
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetDashboard)
  async getDashboard(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendGetDashboardRequest = request.body;

    let { traceId } = reqValid.info;
    let { projectId, repoId, branchId, envId, dashboardId, timezone } =
      reqValid.payload;

    let repoType = await this.sessionsService.checkRepoId({
      repoId: repoId,
      userId: user.userId,
      projectId: projectId,
      allowProdRepo: true
    });

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: repoId,
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

    let payload: ToBackendGetDashboardResponsePayload =
      await this.queryInfoDashboardService.getDashboardData({
        traceId: traceId,
        user: user,
        userMember: userMember,
        project: project,
        bridge: bridge,
        projectId: projectId,
        repoId: repoId,
        envId: envId,
        dashboardId: dashboardId,
        timezone: timezone,
        skipUi: false
      });

    return payload;
  }
}
