import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  MemberTab,
  ModelTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { ModelEnt, modelsTable } from '#backend/drizzle/postgres/schema/models';
import { checkAccess } from '#backend/functions/check-access';
import { checkModelAccess } from '#backend/functions/check-model-access';
import { ErEnum } from '#common/enums/er.enum';
import { isUndefined } from '#common/functions/is-undefined';
import { Member } from '#common/interfaces/backend/member';
import { ModelPart } from '#common/interfaces/backend/model-part';
import { ModelPartX } from '#common/interfaces/backend/model-part-x';
import { ModelX } from '#common/interfaces/backend/model-x';
import { Model } from '#common/interfaces/blockml/model';
import { ServerError } from '#common/models/server-error';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';

@Injectable()
export class ModelsService {
  constructor(
    private tabService: TabService,
    private hashService: HashService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  tabToApi(item: { model: ModelTab; hasAccess: boolean }): ModelX {
    let { model, hasAccess } = item;

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
      fileText: model.fileText,
      storeContent: model.storeContent,
      dateRangeIncludesRightSide: model.dateRangeIncludesRightSide,
      accessRoles: model.accessRoles,
      label: model.label,
      fields: model.fields,
      nodes: model.nodes,
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
      source: apiModel.source,
      malloyModelDef: apiModel.malloyModelDef,
      filePath: apiModel.filePath,
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
        message: ErEnum.BACKEND_MODEL_DOES_NOT_EXIST
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
        message: ErEnum.BACKEND_MODEL_ID_IS_NOT_DEFINED
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
        message: ErEnum.BACKEND_MODEL_DOES_NOT_EXIST
      });
    }

    let isAccessGranted = checkModelAccess({
      member: userMember,
      modelAccessRoles: model.accessRoles
    });

    if (isAccessGranted === false) {
      throw new ServerError({
        message: ErEnum.BACKEND_FORBIDDEN_MODEL
      });
    }

    return model;
  }

  async getModelPartXs(item: {
    structId: string;
    // user: UserTab;
    apiUserMember: Member;
  }): Promise<ModelPartX[]> {
    let {
      structId,
      // , user,
      apiUserMember
    } = item;

    let modelParts: ModelTab[] = await this.db.drizzle
      .select({
        keyTag: modelsTable.keyTag,
        modelId: modelsTable.modelId,
        st: modelsTable.st
        // lt: {},
      })
      .from(modelsTable)
      .where(
        and(
          // inArray(modelsTable.modelId, modelIds),
          eq(modelsTable.structId, structId)
        )
      )
      .then(xs => xs.map(x => this.tabService.modelEntToTab(x as ModelEnt)));

    let apiModelParts = modelParts.map(x =>
      this.tabToModelPart({
        model: x
      })
    );

    let apiModelPartXs = apiModelParts.map(x => {
      let modelPartX: ModelPartX = Object.assign({}, x, {
        hasAccess: checkAccess({
          member: apiUserMember,
          accessRoles: x.accessRoles
        })
      });
      return modelPartX;
    });

    return apiModelPartXs;
  }

  tabToModelPart(item: { model: ModelTab }): ModelPart {
    let { model } = item;

    let modelPart: ModelPart = {
      structId: model.structId,
      modelId: model.modelId,
      accessRoles: model.accessRoles
    };

    return modelPart;
  }
}
