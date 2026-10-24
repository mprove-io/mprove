import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  type ModelEnt,
  modelsTable
} from '#backend/drizzle/postgres/schema/models';
import { checkModelAccess } from '#backend/functions/check-model-access/check-model-access';
import { tabToModelPart } from '#backend/functions/db/models/get-model-part-xs/tab-to-model-part/tab-to-model-part';
import type { DbService } from '#backend/services/db/db.service';
import type { GetModelPartXsError } from '#common/types/backend/function-errors/get-model-part-xs-error';
import type { Member } from '#common/types/backend/parts/member';
import type { ModelPart } from '#common/types/backend/parts/model/model-part';
import type { ModelPartX } from '#common/types/backend/parts/model/model-part-x';

export async function getModelPartXs(item: {
  structId: string;
  apiUserMember: Member;
  db: DbService;
}): Result.ResultAsync<ModelPartX[], GetModelPartXsError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('models', v =>
      v.db.drizzle
        .select({
          keyTag: modelsTable.keyTag,
          modelId: modelsTable.modelId,
          st: modelsTable.st
        })
        .from(modelsTable)
        .where(and(eq(modelsTable.structId, v.structId)))
        .then(xs =>
          Result.sequence(xs, x =>
            v.db.models.entToTab({
              ent: x as ModelEnt
            })
          )
        )
    ),
    Result.map((v): ModelPartX[] =>
      v.models.map(model => {
        let apiModelPart: ModelPart = tabToModelPart({
          model: model
        });

        let modelPartX: ModelPartX = Object.assign({}, apiModelPart, {
          hasAccess: checkModelAccess({
            member: v.apiUserMember,
            modelAccessRoles: apiModelPart.accessRolesCombined
          })
        });

        return modelPartX;
      })
    )
  );
}
