import { Inject, Injectable } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  MemberTab,
  ModelTab
} from '#backend/drizzle/postgres/schema/_tabs';
import {
  type ModelEnt,
  modelsTable
} from '#backend/drizzle/postgres/schema/models';
import { checkModelAccess } from '#backend/functions/check-model-access/check-model-access';
import { HashService } from '#backend/services/hash/hash.service';
import { TabService } from '#backend/services/tab/tab.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { GetModelPartXsResultError } from '#common/types/backend/function-errors/get-model-part-xs-result-error';
import type { ModelEntToTabResultError } from '#common/types/backend/function-errors/model-ent-to-tab-result-error';
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
    @Inject(DRIZZLE) private db: Db
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

  async getModelCheckExists(item: {
    modelId: string;
    structId: string;
  }): Promise<ModelTab> {
    let { modelId, structId } = item;

    let model = await this.db.drizzle.query.modelsTable
      .findFirst({
        where: and(
          eq(modelsTable.structId, structId),
          eq(modelsTable.modelId, modelId)
        )
      })
      .then(x => this.tabService.modelEntToTab(x));

    if (isUndefined(model)) {
      throw new ServerError({
        message: 'BACKEND_MODEL_DOES_NOT_EXIST'
      });
    }

    return model;
  }

  async getModelCheckExistsAndAccess(item: {
    modelId: string;
    structId: string;
    userMember: MemberTab;
  }): Promise<ModelTab> {
    let { modelId, structId, userMember } = item;

    if (isUndefined(modelId)) {
      throw new ServerError({
        message: 'BACKEND_MODEL_ID_IS_NOT_DEFINED'
      });
    }

    let model = await this.db.drizzle.query.modelsTable
      .findFirst({
        where: and(
          eq(modelsTable.structId, structId),
          eq(modelsTable.modelId, modelId)
        )
      })
      .then(x => this.tabService.modelEntToTab(x));

    if (isUndefined(model)) {
      throw new ServerError({
        message: 'BACKEND_MODEL_DOES_NOT_EXIST'
      });
    }

    let isAccessGranted = checkModelAccess({
      member: userMember,
      modelAccessRoles: model.accessRolesCombined
    });

    if (isAccessGranted === false) {
      throw new ServerError({
        message: 'BACKEND_FORBIDDEN_MODEL'
      });
    }

    return model;
  }

  async getModelPartXs(item: {
    structId: string;
    // user: UserTab;
    apiUserMember: Member;
  }): Promise<ModelPartX[]> {
    let result: Result.Result<ModelPartX[], GetModelPartXsResultError> =
      await this.getModelPartXsResult(item);

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let modelPartXs: ModelPartX[] = result.value;

    return modelPartXs;
  }

  async getModelPartXsResult(item: {
    structId: string;
    apiUserMember: Member;
  }): Result.ResultAsync<ModelPartX[], GetModelPartXsResultError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'models',
        (v): Result.ResultAsync<ModelTab[], ModelEntToTabResultError> =>
          this.db.drizzle
            .select({
              keyTag: modelsTable.keyTag,
              modelId: modelsTable.modelId,
              st: modelsTable.st
            })
            .from(modelsTable)
            .where(and(eq(modelsTable.structId, v.structId)))
            .then(modelEnts =>
              Result.sequence(modelEnts, modelEnt =>
                this.tabService.modelEntToTabResult({
                  modelEnt: modelEnt as ModelEnt
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
