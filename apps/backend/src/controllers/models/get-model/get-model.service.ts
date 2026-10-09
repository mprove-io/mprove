import { Injectable } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import type {
  BranchTab,
  BridgeTab,
  MemberTab,
  ModelTab,
  StructTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { checkModelAccess } from '#backend/functions/check-model-access/check-model-access';
import { BranchesService } from '#backend/services/db/branches/branches.service';
import { BridgesService } from '#backend/services/db/bridges/bridges.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ModelsService } from '#backend/services/db/models/models.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import { ServerError } from '#common/classes/server-error/server-error';
import type { GetBranchCheckExistsResultError } from '#common/types/backend/function-errors/get-branch-check-exists-result-error';
import type { GetBridgeCheckExistsResultError } from '#common/types/backend/function-errors/get-bridge-check-exists-result-error';
import type { GetMemberCheckExistsResultError } from '#common/types/backend/function-errors/get-member-check-exists-result-error';
import type { GetModelCheckExistsResultError } from '#common/types/backend/function-errors/get-model-check-exists-result-error';
import type { GetModelPartXsResultError } from '#common/types/backend/function-errors/get-model-part-xs-result-error';
import type { GetModelResultError } from '#common/types/backend/function-errors/get-model-result-error';
import type { GetStructCheckExistsResultError } from '#common/types/backend/function-errors/get-struct-check-exists-result-error';
import type { Member } from '#common/types/backend/parts/member';
import type { ModelPartX } from '#common/types/backend/parts/model/model-part-x';
import type { ModelX } from '#common/types/backend/parts/model/model-x';
import type { ToBackendGetModelOutput } from '#common/types/backend/routes/models/get-model/get-model-output';

@Injectable()
export class GetModelService {
  constructor(
    private sessionsService: SessionsService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private branchesService: BranchesService,
    private envsService: EnvsService,
    private bridgesService: BridgesService,
    private modelsService: ModelsService,
    private structsService: StructsService
  ) {}

  async getModel(item: {
    userId: string;
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    modelId: string;
    getMalloy: boolean;
  }): Promise<ToBackendGetModelOutput> {
    let result: Result.Result<ToBackendGetModelOutput, GetModelResultError> =
      await this.getModelResult(item);

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let payload: ToBackendGetModelOutput = result.value;

    return payload;
  }

  async getModelResult(item: {
    userId: string;
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    modelId: string;
    getMalloy: boolean;
  }): Result.ResultAsync<ToBackendGetModelOutput, GetModelResultError> {
    return Result.pipe(
      Result.succeed(item),
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
      // Users can get models for dashboard/report filters without model access.
      Result.bind(
        'model',
        (v): Result.ResultAsync<ModelTab, GetModelCheckExistsResultError> =>
          this.modelsService.getModelCheckExistsResult({
            structId: v.bridge.structId,
            modelId: v.modelId
          })
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
      Result.bind('apiModel', (v): Result.Result<ModelX, never> => {
        let apiModel: ModelX = this.modelsService.tabToApi({
          model: v.model,
          hasAccess: checkModelAccess({
            member: v.userMember,
            modelAccessRoles: v.model.accessRolesCombined
          })
        });

        if (v.getMalloy === false) {
          delete apiModel.malloyModelDef;
        }

        return Result.succeed(apiModel);
      }),
      Result.map(
        (v): ToBackendGetModelOutput => ({
          needValidate: v.bridge.needValidate,
          struct: this.structsService.tabToApi({
            struct: v.struct,
            modelPartXs: v.modelPartXs
          }),
          userMember: v.apiUserMember,
          model: v.apiModel
        })
      )
    );
  }
}
