import { Injectable } from '@nestjs/common';
import {
  ModelEnx,
  ModelLt,
  ModelSt
} from '~backend/drizzle/postgres/enx/model-enx';
import { Model } from '~common/interfaces/blockml/model';
import { HashService } from './hash.service';
import { TabService } from './tab.service';

@Injectable()
export class WrapApiToEnxService {
  constructor(
    private tabService: TabService,
    private hashService: HashService
  ) {}

  wrapApiToEnxModel(model: Model): ModelEnx {
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
