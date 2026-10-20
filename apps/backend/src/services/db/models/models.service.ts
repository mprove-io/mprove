import { Injectable } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type {
  MemberTab,
  ModelTab
} from '#backend/drizzle/postgres/schema/_tabs';
import {
  type ModelEnt,
  modelsTable
} from '#backend/drizzle/postgres/schema/models';
import { checkModelAccess } from '#backend/functions/check-model-access/check-model-access';
import { DbService } from '#backend/services/db/db.service';
import { HashService } from '#backend/services/hash/hash.service';
import { TabService } from '#backend/services/tab/tab.service';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { DbModelsFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/models/db-models-find-first-check-exists-error';
import type { GetModelCheckExistsAndAccessError } from '#common/types/backend/function-errors/get-model-check-exists-and-access-error';
import type { GetModelPartXsError } from '#common/types/backend/function-errors/get-model-part-xs-error';
import type { ModelEntToTabError } from '#common/types/backend/function-errors/model-ent-to-tab-error';
import type { Member } from '#common/types/backend/parts/member';
import type { ModelPart } from '#common/types/backend/parts/model/model-part';
import type { ModelPartX } from '#common/types/backend/parts/model/model-part-x';
import type { ModelX } from '#common/types/backend/parts/model/model-x';
import type { Model } from '#common/types/blockml/parts/model/model';

@Injectable()
export class ModelsService {
  constructor(
    private tabService: TabService,
    private hashService: HashService,
    private db: DbService
  ) {}

  tabToApi(item: { model: ModelTab; hasAccess: boolean }): ModelX {
    let { model, hasAccess } = item;

    let timeframeBaseFieldIds: string[];
    let fields;
    let nodes;

    if (isDefined(model.fields)) {
      timeframeBaseFieldIds = model.fields
        .filter(field => field.isTimeframeBase === true)
        .map(field => field.id);

      fields = model.fields.filter(field => field.isTimeframeBase === false);
    }

    if (isDefined(model.nodes)) {
      nodes = model.nodes.map(node => {
        node.children?.map(midNode => {
          if (midNode.children) {
            midNode.children = midNode.children?.filter(child => {
              return (
                child.isField === false ||
                timeframeBaseFieldIds.indexOf(child.id) < 0
              );
            });
          }

          return midNode;
        });

        return node;
      });
    }

    let apiModel: ModelX = {
      structId: model.structId,
      modelId: model.modelId,
      type: model.type,
      source: model.source,
      malloyModelDef: model.malloyModelDef,
      hasAccess: hasAccess,
      connectionId: model.connectionId,
      connectionType: model.connectionType,
      filePath: model.filePath,
      space: model.space,
      fileText: model.fileText,
      storeContent: model.storeContent,
      dateRangeIncludesRightSide: model.dateRangeIncludesRightSide,
      accessRoles: model.accessRoles,
      accessRolesCombined: model.accessRolesCombined,
      spaceFullTitle: model.spaceFullTitle,
      label: model.label,
      fields: fields,
      nodes: nodes,
      serverTs: model.serverTs
    };

    return apiModel;
  }

  apiToTab(item: { apiModel: Model }): ModelTab {
    let { apiModel } = item;

    if (isUndefined(apiModel)) {
      return;
    }

    let model: ModelTab = {
      modelFullId: this.hashService.makeModelFullId({
        structId: apiModel.structId,
        modelId: apiModel.modelId
      }),
      structId: apiModel.structId,
      modelId: apiModel.modelId,
      type: apiModel.type,
      connectionId: apiModel.connectionId,
      connectionType: apiModel.connectionType,
      accessRoles: apiModel.accessRoles,
      accessRolesCombined: apiModel.accessRolesCombined,
      source: apiModel.source,
      malloyModelDef: apiModel.malloyModelDef,
      filePath: apiModel.filePath,
      space: apiModel.space,
      spaceFullTitle: apiModel.spaceFullTitle,
      fileText: apiModel.fileText,
      storeContent: apiModel.storeContent,
      dateRangeIncludesRightSide: apiModel.dateRangeIncludesRightSide,
      label: apiModel.label,
      fields: apiModel.fields,
      nodes: apiModel.nodes,
      keyTag: undefined,
      serverTs: apiModel.serverTs
    };

    return model;
  }

  async getModelCheckExistsAndAccess(item: {
    modelId: string;
    structId: string;
    userMember: MemberTab;
  }): Result.ResultAsync<ModelTab, GetModelCheckExistsAndAccessError> {
    return Result.pipe(
      Result.succeed(item),
      Result.andThrough(v =>
        isUndefined(v.modelId)
          ? Result.fail({ code: 'BACKEND_MODEL_ID_IS_NOT_DEFINED' })
          : Result.succeed()
      ),
      Result.bind(
        'model',
        (v): Result.ResultAsync<ModelTab, DbModelsFindFirstCheckExistsError> =>
          this.db.models.findFirstCheckExists({
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

  async getModelPartXs(item: {
    structId: string;
    apiUserMember: Member;
  }): Result.ResultAsync<ModelPartX[], GetModelPartXsError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'models',
        (v): Result.ResultAsync<ModelTab[], ModelEntToTabError> =>
          this.db.drizzle
            .select({
              keyTag: modelsTable.keyTag,
              modelId: modelsTable.modelId,
              st: modelsTable.st
            })
            .from(modelsTable)
            .where(and(eq(modelsTable.structId, v.structId)))
            .then(xs =>
              Result.sequence(xs, x =>
                this.tabService.modelEntToTab({
                  modelEnt: x as ModelEnt
                })
              )
            )
      ),
      Result.map((v): ModelPartX[] =>
        v.models.map(model => {
          let apiModelPart: ModelPart = this.tabToModelPart({
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

  tabToModelPart(item: { model: ModelTab }): ModelPart {
    let { model } = item;

    let modelPart: ModelPart = {
      structId: model.structId,
      modelId: model.modelId,
      accessRoles: model.accessRoles,
      accessRolesCombined: model.accessRolesCombined
    };

    return modelPart;
  }
}
