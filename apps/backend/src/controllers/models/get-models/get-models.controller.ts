import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { and, eq, inArray, type SQL } from 'drizzle-orm';
import {
  ToBackendGetModelsRequestDto,
  ToBackendGetModelsResponseDto
} from '#backend/controllers/models/get-models/get-models.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { checkModelAccess } from '#backend/functions/check-model-access/check-model-access';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ModelsService } from '#backend/services/db/models/models.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetModelsOutput } from '#common/types/backend/routes/models/get-models/get-models-output';

@ApiTags('Models')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetModelsController {
  constructor(
    private membersService: MembersService,
    private sessionsService: SessionsService,
    private modelsService: ModelsService,
    private structsService: StructsService,
    private envsService: EnvsService,
    private db: DbService
  ) {}

  @Post('api/ToBackendGetModels' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'GetModels',
    description: 'Get models'
  })
  @ApiOkResponse({
    type: ToBackendGetModelsResponseDto
  })
  async getModels(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetModelsRequestDto
  ): Promise<BackendResultForOperation<'getModels'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        repoId: body.input.repoId,
        branchId: body.input.branchId,
        envId: body.input.envId,
        filterByModelIds: body.input.filterByModelIds,
        userId: user.userId
      }),
      Result.andThrough(v =>
        this.sessionsService.checkRepoId({
          repoId: v.repoId,
          userId: v.userId,
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
            eq(membersTable.memberId, v.userId),
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
      Result.bind('models', async v => {
        let where: SQL[] = [eq(modelsTable.structId, v.bridge.structId)];

        if (isDefined(v.filterByModelIds) && v.filterByModelIds.length > 0) {
          where = [...where, inArray(modelsTable.modelId, v.filterByModelIds)];
        }

        return this.db.models.findMany({ where: and(...where) });
      }),
      Result.bind('struct', v =>
        this.structsService.getStructCheckExists({
          structId: v.bridge.structId,
          projectId: v.projectId
        })
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
      Result.bind('apiModels', v =>
        Result.succeed(
          v.models
            .map(model =>
              this.modelsService.tabToApi({
                model: model,
                hasAccess: checkModelAccess({
                  member: v.userMember,
                  modelAccessRoles: model.accessRolesCombined
                })
              })
            )
            .sort((a, b) =>
              a.label > b.label ? 1 : b.label > a.label ? -1 : 0
            )
        )
      ),
      Result.map(
        (v): ToBackendGetModelsOutput => ({
          needValidate: v.bridge.needValidate,
          struct: this.structsService.tabToApi({
            struct: v.struct,
            modelPartXs: v.modelPartXs
          }),
          userMember: v.apiUserMember,
          models: v.apiModels
        })
      )
    );
  }
}
