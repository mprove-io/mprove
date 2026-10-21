import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  ToBackendGetDashboardsRequestDto,
  ToBackendGetDashboardsResponseDto
} from '#backend/controllers/dashboards/get-dashboards/get-dashboards.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { checkModelAccess } from '#backend/functions/check-model-access/check-model-access';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DashboardsService } from '#backend/services/db/dashboards/dashboards.service';
import { DbService } from '#backend/services/db/db.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ModelsService } from '#backend/services/db/models/models.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetDashboardsOutput } from '#common/types/backend/routes/dashboards/get-dashboards/get-dashboards-output';

@ApiTags('Dashboards')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetDashboardsController {
  constructor(
    private membersService: MembersService,
    private modelsService: ModelsService,
    private dashboardsService: DashboardsService,
    private structsService: StructsService,
    private sessionsService: SessionsService,
    private envsService: EnvsService,
    private db: DbService
  ) {}

  @Post('api/ToBackendGetDashboards' satisfies ToBackendRoute)
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
  ): Promise<BackendResultForOperation<'getDashboards'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        repoId: body.input.repoId,
        branchId: body.input.branchId,
        envId: body.input.envId,
        user: user
      }),
      Result.andThrough(v =>
        this.sessionsService.checkRepoId({
          repoId: v.repoId,
          userId: v.user.userId,
          projectId: v.projectId,
          allowProdRepo: true
        })
      ),
      Result.andThrough(v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.bind('userMember', v =>
        this.db.members.findFirstCheckExists({
          where: and(
            eq(membersTable.memberId, v.user.userId),
            eq(membersTable.projectId, v.projectId)
          )
        })
      ),
      Result.bind('branch', v =>
        this.db.branches.findFirstCheckExists({
          where: and(
            eq(branchesTable.projectId, v.projectId),
            eq(branchesTable.repoId, v.repoId),
            eq(branchesTable.branchId, v.branchId)
          )
        })
      ),
      Result.andThrough(v =>
        this.envsService.getEnvCheckExistsAndAccess({
          projectId: v.projectId,
          envId: v.envId,
          member: v.userMember
        })
      ),
      Result.bind('bridge', v =>
        this.db.bridges.findFirstCheckExists({
          where: and(
            eq(bridgesTable.projectId, v.branch.projectId),
            eq(bridgesTable.repoId, v.branch.repoId),
            eq(bridgesTable.branchId, v.branch.branchId),
            eq(bridgesTable.envId, v.envId)
          )
        })
      ),
      Result.bind('models', v =>
        this.db.models.findMany({
          where: eq(modelsTable.structId, v.bridge.structId)
        })
      ),
      Result.bind('struct', v =>
        this.structsService.getStructCheckExists({
          structId: v.bridge.structId,
          projectId: v.projectId
        })
      ),
      Result.bind('apiModels', v =>
        Result.succeed(
          v.models.map(model =>
            this.modelsService.tabToApi({
              model: model,
              hasAccess: checkModelAccess({
                member: v.userMember,
                modelAccessRoles: model.accessRolesCombined
              })
            })
          )
        )
      ),
      Result.bind('apiUserMember', v =>
        Result.succeed(this.membersService.tabToApi({ member: v.userMember }))
      ),
      Result.bind('modelPartXs', v =>
        this.modelsService.getModelPartXs({
          structId: v.struct.structId,
          apiUserMember: v.apiUserMember
        })
      ),
      Result.bind('dashboardsCatalog', v =>
        this.dashboardsService.getDashboardsCatalog({
          projectId: v.projectId,
          structId: v.bridge.structId,
          user: v.user,
          apiUserMember: v.apiUserMember,
          spaces: v.struct.spaces
        })
      ),
      Result.map(
        (v): ToBackendGetDashboardsOutput => ({
          needValidate: v.bridge.needValidate,
          struct: this.structsService.tabToApi({
            struct: v.struct,
            modelPartXs: v.modelPartXs
          }),
          userMember: v.apiUserMember,
          models: v.apiModels.sort((a, b) => {
            let aLabel: string = a.label?.toUpperCase();

            let bLabel: string = b.label?.toUpperCase();

            return aLabel > bLabel ? 1 : bLabel > aLabel ? -1 : 0;
          }),
          dashboardUnitDrafts: v.dashboardsCatalog.dashboardUnitDrafts,
          dashboardSpaceNodes: v.dashboardsCatalog.dashboardSpaceNodes
        })
      )
    );
  }
}
