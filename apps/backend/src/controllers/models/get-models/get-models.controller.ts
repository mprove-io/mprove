import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { and, eq, inArray, type SQL } from 'drizzle-orm';
import {
  ToBackendGetModelsRequestDto,
  ToBackendGetModelsResponseDto
} from '#backend/controllers/models/get-models/get-models.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  BranchTab,
  BridgeTab,
  MemberTab,
  ModelTab,
  StructTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { checkModelAccess } from '#backend/functions/check-model-access/check-model-access';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { BranchesService } from '#backend/services/db/branches/branches.service';
import { BridgesService } from '#backend/services/db/bridges/bridges.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ModelsService } from '#backend/services/db/models/models.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { GetBranchCheckExistsResultError } from '#common/types/backend/function-errors/get-branch-check-exists-result-error';
import type { GetBridgeCheckExistsResultError } from '#common/types/backend/function-errors/get-bridge-check-exists-result-error';
import type { GetMemberCheckExistsResultError } from '#common/types/backend/function-errors/get-member-check-exists-result-error';
import type { GetModelPartXsResultError } from '#common/types/backend/function-errors/get-model-part-xs-result-error';
import type { GetStructCheckExistsResultError } from '#common/types/backend/function-errors/get-struct-check-exists-result-error';
import type { ModelEntToTabResultError } from '#common/types/backend/function-errors/model-ent-to-tab-result-error';
import type { Member } from '#common/types/backend/parts/member';
import type { ModelPartX } from '#common/types/backend/parts/model/model-part-x';
import type { ModelX } from '#common/types/backend/parts/model/model-x';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetModelsOutput } from '#common/types/backend/routes/models/get-models/get-models-output';

@ApiTags('Models')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetModelsController {
  constructor(
    private tabService: TabService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private sessionsService: SessionsService,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private modelsService: ModelsService,
    private structsService: StructsService,
    private envsService: EnvsService,
    @Inject(DRIZZLE) private db: Db
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
        this.sessionsService.checkRepoIdResult({
          repoId: v.repoId,
          userId: v.userId,
          projectId: v.projectId,
          allowProdRepo: true
        })
      ),
      Result.andThrough(v =>
        this.projectsService.getProjectCheckExistsResult({
          projectId: v.projectId
        })
      ),
      Result.bind(
        'userMember',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckExistsResultError> =>
          this.membersService.getMemberCheckExistsResult({
            projectId: v.projectId,
            memberId: v.userId
          })
      ),
      Result.bind(
        'branch',
        (v): Result.ResultAsync<BranchTab, GetBranchCheckExistsResultError> =>
          this.branchesService.getBranchCheckExistsResult({
            projectId: v.projectId,
            repoId: v.repoId,
            branchId: v.branchId
          })
      ),
      Result.andThrough(v =>
        this.envsService.getEnvCheckExistsAndAccessResult({
          projectId: v.projectId,
          envId: v.envId,
          member: v.userMember
        })
      ),
      Result.bind(
        'bridge',
        (v): Result.ResultAsync<BridgeTab, GetBridgeCheckExistsResultError> =>
          this.bridgesService.getBridgeCheckExistsResult({
            projectId: v.branch.projectId,
            repoId: v.branch.repoId,
            branchId: v.branch.branchId,
            envId: v.envId
          })
      ),
      Result.bind(
        'models',
        async (v): Result.ResultAsync<ModelTab[], ModelEntToTabResultError> => {
          let where: SQL[] = [eq(modelsTable.structId, v.bridge.structId)];

          if (isDefined(v.filterByModelIds) && v.filterByModelIds.length > 0) {
            where = [
              ...where,
              inArray(modelsTable.modelId, v.filterByModelIds)
            ];
          }

          return this.db.drizzle.query.modelsTable
            .findMany({ where: and(...where) })
            .then(modelEnts =>
              Result.sequence(modelEnts, modelEnt =>
                this.tabService.modelEntToTabResult({ modelEnt: modelEnt })
              )
            );
        }
      ),
      Result.bind(
        'struct',
        (v): Result.ResultAsync<StructTab, GetStructCheckExistsResultError> =>
          this.structsService.getStructCheckExistsResult({
            structId: v.bridge.structId,
            projectId: v.projectId
          })
      ),
      Result.bind(
        'apiUserMember',
        (v): Result.Result<Member, never> =>
          Result.succeed(this.membersService.tabToApi({ member: v.userMember }))
      ),
      Result.bind(
        'modelPartXs',
        (v): Result.ResultAsync<ModelPartX[], GetModelPartXsResultError> =>
          this.modelsService.getModelPartXsResult({
            structId: v.struct.structId,
            apiUserMember: v.apiUserMember
          })
      ),
      Result.bind(
        'apiModels',
        (v): Result.Result<ModelX[], never> =>
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
