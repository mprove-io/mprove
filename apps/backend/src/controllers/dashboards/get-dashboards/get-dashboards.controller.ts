import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { and, eq, or } from 'drizzle-orm';
import {
  ToBackendGetDashboardsRequestDto,
  ToBackendGetDashboardsResponseDto
} from '#backend/controllers/dashboards/get-dashboards/get-dashboards.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { dashboardsTable } from '#backend/drizzle/postgres/schema/dashboards';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { checkAccess } from '#backend/functions/check-access';
import { checkModelAccess } from '#backend/functions/check-model-access';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { BranchesService } from '#backend/services/db/branches.service';
import { BridgesService } from '#backend/services/db/bridges.service';
import { EnvsService } from '#backend/services/db/envs.service';
import { FavoritesService } from '#backend/services/db/favorites.service';
import { MembersService } from '#backend/services/db/members.service';
import { ModelsService } from '#backend/services/db/models.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { SessionsService } from '#backend/services/db/sessions.service';
import { StructsService } from '#backend/services/db/structs.service';
import { SpaceService } from '#backend/services/space.service';
import { TabService } from '#backend/services/tab.service';
import { UnitsService } from '#backend/services/units.service';
import { FavoriteTypeEnum } from '#common/enums/favorite-type.enum';
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
    private favoritesService: FavoritesService,
    private structsService: StructsService,
    private spaceService: SpaceService,
    private unitsService: UnitsService,
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
          modelAccessRoles: model.accessRolesCombined
        })
      })
    );

    let apiUserMember = this.membersService.tabToApi({ member: userMember });

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
      dashboardUnitDrafts: [],
      dashboardSpaceNodes: []
    };

    let dashboards = await this.db.drizzle.query.dashboardsTable
      .findMany({
        where: and(
          eq(dashboardsTable.structId, bridge.structId),
          or(
            eq(dashboardsTable.draft, false),
            eq(dashboardsTable.creatorId, user.userId)
          )
        )
      })
      .then(xs => xs.map(x => this.tabService.dashboardEntToTab(x)));

    let dashboardTabsGrantedAccess = dashboards.filter(dashboard => {
      if (dashboard.draft === true) {
        return true;
      }

      return checkAccess({
        member: apiUserMember,
        accessRoles: dashboard.accessRolesCombined,
        filePath: dashboard.filePath
      });
    });

    let draftDashboards = dashboardTabsGrantedAccess.filter(
      dashboard => dashboard.draft === true
    );

    let nonDraftDashboards = dashboardTabsGrantedAccess.filter(
      dashboard => dashboard.draft === false
    );

    let dashboardTargetIds = nonDraftDashboards.map(
      dashboard => dashboard.dashboardId
    );

    let favoriteDashboardIds = await this.favoritesService.getFavoriteTargetIds(
      {
        projectId: projectId,
        userId: user.userId,
        type: FavoriteTypeEnum.Dashboard,
        targetIds: dashboardTargetIds
      }
    );

    let dashboardSpaceUnits = nonDraftDashboards.map(dashboard =>
      this.unitsService.makeDashboardSpaceUnit({
        dashboard: dashboard,
        member: apiUserMember,
        favoriteDashboardIds: favoriteDashboardIds
      })
    );

    payload.dashboardUnitDrafts = draftDashboards.map(dashboard =>
      this.unitsService.makeDashboardUnit({
        dashboard: dashboard,
        member: apiUserMember,
        favoriteDashboardIds: [],
        space: dashboard.space,
        displaySpace: dashboard.space ?? ''
      })
    );

    payload.dashboardSpaceNodes = this.spaceService.makeSpaceNodes({
      spaces: struct.spaces ?? [],
      units: dashboardSpaceUnits,
      member: apiUserMember
    });

    return payload;
  }
}
