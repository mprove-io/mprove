import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import { branchesTable } from '#backend/drizzle/postgres/tables/branches';
import { bridgesTable } from '#backend/drizzle/postgres/tables/bridges';
import { membersTable } from '#backend/drizzle/postgres/tables/members';
import { modelsTable } from '#backend/drizzle/postgres/tables/models';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import { getEnvCheckExistsAndAccess } from '#backend/functions/db/envs/get-env-check-exists-and-access/get-env-check-exists-and-access';
import { memberTabToApi } from '#backend/functions/db/members/member-tab-to-api/member-tab-to-api';
import { checkModelAccess } from '#backend/functions/db/models/check-model-access/check-model-access';
import { getModelPartXs } from '#backend/functions/db/models/get-model-part-xs/get-model-part-xs';
import { modelTabToApi } from '#backend/functions/db/models/model-tab-to-api/model-tab-to-api';
import { getStructCheckExists } from '#backend/functions/db/structs/get-struct-check-exists/get-struct-check-exists';
import { structTabToApi } from '#backend/functions/db/structs/struct-tab-to-api/struct-tab-to-api';
import { checkRepoId } from '#backend/functions/repos/check-repo-id/check-repo-id';
import { DbService } from '#backend/services/db/db.service';
import type { GetModelError } from '#common/types/backend/function-errors/get-model-error';
import type { ModelX } from '#common/types/backend/parts/model/model-x';
import type { ToBackendGetModelOutput } from '#common/types/backend/routes/models/get-model/get-model-output';

@Injectable()
export class GetModelService {
  constructor(
    private db: DbService,
    private cs: ConfigService<BackendConfig>
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
        checkRepoId({
          repoId: v.repoId,
          userId: v.userId,
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
        getStructCheckExists({
          structId: v.bridge.structId,
          projectId: v.projectId,
          cs: this.cs,
          db: this.db
        })
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
      Result.bind('apiModel', v => {
        let apiModel: ModelX = modelTabToApi({
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
          struct: structTabToApi({
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
