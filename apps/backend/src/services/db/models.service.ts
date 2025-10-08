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

  tabToApi(item: {
    model: ModelTab;
    hasAccess: boolean;
  }): ModelX {
    let { model, hasAccess } = item;

    let apiModel: ModelX = {
      structId: model.structId,
      modelId: model.modelId,
      type: model.type,
      source: model.lt.source,
      malloyModelDef: model.lt.malloyModelDef,
      hasAccess: hasAccess,
      connectionId: model.connectionId,
      connectionType: model.connectionType,
      filePath: model.lt.filePath,
      fileText: model.lt.fileText,
      storeContent: model.lt.storeContent,
      dateRangeIncludesRightSide: model.lt.dateRangeIncludesRightSide,
      accessRoles: model.st.accessRoles,
      label: model.lt.label,
      fields: model.lt.fields,
      nodes: model.lt.nodes,
      serverTs: model.serverTs
    };

    return apiModel;
  }

  apiToTab(model: Model): ModelTab {
    let modelSt: ModelSt = {
      accessRoles: model.accessRoles
    };

    let modelLt: ModelLt = {
      source: model.source,
      malloyModelDef: model.malloyModelDef,
      filePath: model.filePath,
      fileText: model.fileText,
      storeContent: model.storeContent,
      dateRangeIncludesRightSide: model.dateRangeIncludesRightSide,
      label: model.label,
      fields: model.fields,
      nodes: model.nodes
    };

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
      st: modelSt,
      lt: modelLt,
      serverTs: model.serverTs
    };

    return modelTab;
  }

  tabToEnt(model: ModelTab): ModelEnt {
    let modelEnt: ModelEnt = {
      ...model,
      st: this.tabService.encrypt({ data: model.st }),
      lt: this.tabService.encrypt({ data: model.lt })
    };

    return modelEnt;
  }

  entToTab(model: ModelEnt): ModelTab {
    let modelTab: ModelTab = {
      ...model,
      st: this.tabService.decrypt<ModelSt>({
        encryptedString: model.st
      }),
      lt: this.tabService.decrypt<ModelLt>({
        encryptedString: model.lt
      })
    };

    return modelTab;
  }

  async getModelCheckExists(item: { modelId: string; structId: string }) {
    let { modelId, structId } = item;

    let model = await this.db.drizzle.query.modelsTable.findFirst({
      where: and(
        eq(modelsTable.structId, structId),
        eq(modelsTable.modelId, modelId)
      )
    });

    if (isUndefined(model)) {
      throw new ServerError({
        message: ErEnum.BACKEND_MODEL_DOES_NOT_EXIST
      });
    }

    let modelEnx: ModelEnx = this.wrapToEnxService.wrapToEnxModel(model);

    return modelEnx;
  }
}
