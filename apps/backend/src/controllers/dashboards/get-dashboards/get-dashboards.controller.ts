import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  type ToBackendGetDashboardsRequestDto,
  ToBackendGetDashboardsResponseDto
} from '#backend/controllers/dashboards/get-dashboards/get-dashboards.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { branchesTable } from '#backend/drizzle/postgres/tables/branches';
import { bridgesTable } from '#backend/drizzle/postgres/tables/bridges';
import { membersTable } from '#backend/drizzle/postgres/tables/members';
import { modelsTable } from '#backend/drizzle/postgres/tables/models';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { getDashboardsCatalog } from '#backend/functions/db/dashboards/get-dashboards-catalog/get-dashboards-catalog';
import { getEnvCheckExistsAndAccess } from '#backend/functions/db/envs/get-env-check-exists-and-access/get-env-check-exists-and-access';
import { memberTabToApi } from '#backend/functions/db/members/member-tab-to-api/member-tab-to-api';
import { checkModelAccess } from '#backend/functions/db/models/check-model-access/check-model-access';
import { getModelPartXs } from '#backend/functions/db/models/get-model-part-xs/get-model-part-xs';
import { modelTabToApi } from '#backend/functions/db/models/model-tab-to-api/model-tab-to-api';
import { getStructCheckExists } from '#backend/functions/db/structs/get-struct-check-exists/get-struct-check-exists';
import { structTabToApi } from '#backend/functions/db/structs/struct-tab-to-api/struct-tab-to-api';
import { checkRepoId } from '#backend/functions/repos/check-repo-id/check-repo-id';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetDashboardsOutput } from '#common/types/backend/routes/dashboards/get-dashboards/get-dashboards-output';

@ApiTags('Dashboards')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetDashboardsController {
  constructor(
    private db: DbService,
    private cs: ConfigService<BackendConfig>
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
        checkRepoId({
          repoId: v.repoId,
          userId: v.user.userId,
          projectId: v.projectId,
          allowProdRepo: true,
          db: this.db
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
        getEnvCheckExistsAndAccess({
          db: this.db,
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
        getStructCheckExists({
          structId: v.bridge.structId,
          projectId: v.projectId,
          cs: this.cs,
          db: this.db
        })
      ),
      Result.bind('apiModels', v =>
        Result.succeed(
          v.models.map(model =>
            modelTabToApi({
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
        Result.succeed(
          memberTabToApi({
            member: v.userMember
          })
        )
      ),
      Result.bind('modelPartXs', v =>
        getModelPartXs({
          structId: v.struct.structId,
          apiUserMember: v.apiUserMember,
          db: this.db
        })
      ),
      Result.bind('dashboardsCatalog', v =>
        getDashboardsCatalog({
          db: this.db,
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
          struct: structTabToApi({
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
