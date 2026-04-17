import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { eq } from 'drizzle-orm';
import {
  ToBackendGetDashboardsRequestDto,
  ToBackendGetDashboardsResponseDto
} from '#backend/controllers/dashboards/get-dashboards/get-dashboards.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { checkModelAccess } from '#backend/functions/check-model-access';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { BranchesService } from '#backend/services/db/branches.service';
import { BridgesService } from '#backend/services/db/bridges.service';
import { DashboardsService } from '#backend/services/db/dashboards.service';
import { EnvsService } from '#backend/services/db/envs.service';
import { MembersService } from '#backend/services/db/members.service';
import { ModelsService } from '#backend/services/db/models.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { SessionsService } from '#backend/services/db/sessions.service';
import { StructsService } from '#backend/services/db/structs.service';
import { TabService } from '#backend/services/tab.service';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { ToBackendGetDashboardsResponsePayload } from '#common/zod/to-backend/dashboards/to-backend-get-dashboards';

@ApiTags('Dashboards')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetDashboardsController {
  constructor(
    private tabService: TabService,
    private branchesService: BranchesService,
    private membersService: MembersService,
    private modelsService: ModelsService,
    private dashboardsService: DashboardsService,
    private structsService: StructsService,
    private projectsService: ProjectsService,
    private sessionsService: SessionsService,
    private bridgesService: BridgesService,
    private envsService: EnvsService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetDashboards)
  @ApiOperation({
    summary: 'GetDashboards',
    description: 'Get dashboards'
  })
  @ApiOkResponse({
    type: ToBackendGetDashboardsResponseDto
  })
  async getDashboards(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetDashboardsRequestDto
  ) {
    let { projectId, repoId, branchId, envId } = body.payload;

    let repoType = await this.sessionsService.checkRepoId({
      repoId: repoId,
      userId: user.userId,
      projectId: projectId,
      allowProdRepo: true
    });

    await this.projectsService.getProjectCheckExists({
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

    let env = await this.envsService.getEnvCheckExistsAndAccess({
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

    let models = await this.db.drizzle.query.modelsTable
      .findMany({ where: eq(modelsTable.structId, bridge.structId) })
      .then(xs => xs.map(x => this.tabService.modelEntToTab(x)));

    let apiModels = models.map(model =>
      this.modelsService.tabToApi({
        model: model,
        hasAccess: checkModelAccess({
          member: userMember,
          modelAccessRoles: model.accessRoles
        })
      })
    );

    let apiUserMember = this.membersService.tabToApi({ member: userMember });

    let dashboardParts = await this.dashboardsService.getDashboardParts({
      structId: bridge.structId,
      user: user,
      apiUserMember: apiUserMember
    });

    let struct = await this.structsService.getStructCheckExists({
      structId: bridge.structId,
      projectId: projectId
    });

    let modelPartXs = await this.modelsService.getModelPartXs({
      structId: struct.structId,
      apiUserMember: apiUserMember
    });

    let payload: ToBackendGetDashboardsResponsePayload = {
      needValidate: bridge.needValidate,
      struct: this.structsService.tabToApi({
        struct: struct,
        modelPartXs: modelPartXs
      }),
      userMember: apiUserMember,
      models: apiModels.sort((a, b) => {
        let aLabel = a.label?.toUpperCase();
        let bLabel = b.label?.toUpperCase();

        return aLabel > bLabel ? 1 : bLabel > aLabel ? -1 : 0;
      }),
      dashboardParts: dashboardParts.sort((a, b) => {
        let aTitle = a.title?.toUpperCase();
        let bTitle = b.title?.toUpperCase();

        return aTitle > bTitle ? 1 : bTitle > aTitle ? -1 : 0;
      })
    };

    return payload;
  }
}
