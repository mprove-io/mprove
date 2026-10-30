import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type { MemberTab } from '#backend/drizzle/postgres/tables/members';
import type { ModelTab } from '#backend/drizzle/postgres/tables/models';
import { modelsTable } from '#backend/drizzle/postgres/tables/models';
import { checkModelAccess } from '#backend/functions/db/models/check-model-access/check-model-access';
import type { DbService } from '#backend/services/db/db.service';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { GetModelCheckExistsAndAccessError } from '#common/types/backend/function-errors/get-model-check-exists-and-access-error';

export async function getModelCheckExistsAndAccess(item: {
  modelId: string;
  structId: string;
  userMember: MemberTab;
  db: DbService;
}): Result.ResultAsync<ModelTab, GetModelCheckExistsAndAccessError> {
  return Result.pipe(
    Result.succeed(item),
    Result.andThrough(v =>
      isUndefined(v.modelId)
        ? Result.fail({ code: 'BACKEND_MODEL_ID_IS_NOT_DEFINED' })
        : Result.succeed()
    ),
    Result.bind('model', v =>
      v.db.models.findFirstCheckExists({
        where: and(
          eq(modelsTable.structId, v.structId),
          eq(modelsTable.modelId, v.modelId)
        )
      })
    ),
    Result.andThrough(v =>
      checkModelAccess({
        member: v.userMember,
        modelAccessRoles: v.model.accessRolesCombined
      })
        ? Result.succeed()
        : Result.fail({ code: 'BACKEND_FORBIDDEN_MODEL' })
    ),
    Result.map((v): ModelTab => v.model)
  );
}
