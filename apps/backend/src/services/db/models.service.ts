import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { ModelTab } from '~backend/drizzle/postgres/schema/_tabs';
import { modelsTable } from '~backend/drizzle/postgres/schema/models';
import { ErEnum } from '~common/enums/er.enum';
import { isUndefined } from '~common/functions/is-undefined';
import { ModelX } from '~common/interfaces/backend/model-x';
import { Model } from '~common/interfaces/blockml/model';
import { ServerError } from '~common/models/server-error';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';

@Injectable()
export class ModelsService {
  constructor(
    private tabService: TabService,
    private hashService: HashService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  tabToApi(item: {
    model: ModelTab;
    hasAccess: boolean;
  }): ModelX {
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

  apiToTab(item: {
    apiModel: Model;
  }): ModelTab {
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
}
