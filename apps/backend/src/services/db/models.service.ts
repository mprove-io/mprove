import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { modelsTable } from '~backend/drizzle/postgres/schema/models';
import { ModelEnt } from '~backend/drizzle/postgres/schema/models';
import {
  ModelLt,
  ModelSt,
  ModelTab
} from '~backend/drizzle/postgres/tabs/model-tab';
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

  entToTab(modelEnt: ModelEnt): ModelTab {
    if (isUndefined(modelEnt)) {
      return;
    }

    let model: ModelTab = {
      ...modelEnt,
      ...this.tabService.decrypt<ModelSt>({
        encryptedString: modelEnt.st
      }),
      ...this.tabService.decrypt<ModelLt>({
        encryptedString: modelEnt.lt
      })
    };

    return model;
  }

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

  apiToTab(model: Model): ModelTab {
    let modelTab: ModelTab = {
      modelFullId: this.hashService.makeModelFullId({
        structId: model.structId,
        modelId: model.modelId
      }),
      structId: model.structId,
      modelId: model.modelId,
      type: model.type,
      connectionId: model.connectionId,
      connectionType: model.connectionType,
      accessRoles: model.accessRoles,
      source: model.source,
      malloyModelDef: model.malloyModelDef,
      filePath: model.filePath,
      fileText: model.fileText,
      storeContent: model.storeContent,
      dateRangeIncludesRightSide: model.dateRangeIncludesRightSide,
      label: model.label,
      fields: model.fields,
      nodes: model.nodes,
      serverTs: model.serverTs
    };

    return modelTab;
  }

  async getModelTabCheckExists(item: {
    modelId: string;
    structId: string;
  }): Promise<ModelTab> {
    let { modelId, structId } = item;

    let modelEnt = await this.db.drizzle.query.modelsTable.findFirst({
      where: and(
        eq(modelsTable.structId, structId),
        eq(modelsTable.modelId, modelId)
      )
    });

    if (isUndefined(modelEnt)) {
      throw new ServerError({
        message: ErEnum.BACKEND_MODEL_DOES_NOT_EXIST
      });
    }

    let modelTab: ModelTab = this.entToTab(modelEnt);

    return modelTab;
  }
}
