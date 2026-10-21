import { Injectable } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { checkModelAccess } from '#backend/functions/check-model-access/check-model-access';
import { DbService } from '#backend/services/db/db.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ModelsService } from '#backend/services/db/models/models.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import type { GetModelError } from '#common/types/backend/function-errors/get-model-error';
import type { ModelX } from '#common/types/backend/parts/model/model-x';
import type { ToBackendGetModelOutput } from '#common/types/backend/routes/models/get-model/get-model-output';

@Injectable()
export class GetModelService {
  constructor(
    private sessionsService: SessionsService,
    private membersService: MembersService,
    private envsService: EnvsService,
    private modelsService: ModelsService,
    private structsService: StructsService,
    private db: DbService
  ) {}

  async getModel(item: {
    userId: string;
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    modelId: string;
    getMalloy: boolean;
  }): Result.ResultAsync<ToBackendGetModelOutput, GetModelError> {
    return Result.pipe(
      Result.succeed(item),
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
      // Users can get models for dashboard/report filters without model access.
      Result.bind('model', v =>
        this.db.models.findFirstCheckExists({
          where: and(
            eq(modelsTable.structId, v.bridge.structId),
            eq(modelsTable.modelId, v.modelId)
          )
        })
      ),
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
      Result.bind('apiModel', v => {
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
