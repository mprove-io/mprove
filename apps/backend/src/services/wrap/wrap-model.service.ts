import { Injectable } from '@nestjs/common';
import {
  ModelEnx,
  ModelLt,
  ModelSt
} from '~backend/drizzle/postgres/enx/model-enx';
import { ModelEnt } from '~backend/drizzle/postgres/schema/models';
import { ModelX } from '~common/interfaces/backend/model-x';
import { Model } from '~common/interfaces/blockml/model';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';

@Injectable()
export class WrapModelService {
  constructor(
    private tabService: TabService,
    private hashService: HashService
  ) {}

  entToMx(model: ModelEnt): ModelEnx {
    let modelEnx: ModelEnx = {
      ...model,
      st: this.tabService.decrypt<ModelSt>({
        encryptedString: model.st
      }),
      lt: this.tabService.decrypt<ModelLt>({
        encryptedString: model.lt
      })
    };

    return modelEnx;
  }

  mxToEnt(model: ModelEnx): ModelEnt {
    let modelEnt: ModelEnt = {
      modelFullId: model.modelFullId,
      structId: model.structId,
      modelId: model.modelId,
      type: model.type,
      connectionId: model.connectionId,
      connectionType: model.connectionType,
      st: this.tabService.encrypt({ data: model.st }),
      lt: this.tabService.encrypt({ data: model.lt }),
      serverTs: model.serverTs
    };

    return modelEnt;
  }

  mxToApi(item: {
    model: ModelEnx;
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

  apiToMx(model: Model): ModelEnx {
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

    let modelEnx: ModelEnx = {
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

    return modelEnx;
  }
}
