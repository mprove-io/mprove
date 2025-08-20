import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { BridgeEnt } from '~backend/drizzle/postgres/schema/bridges';
import { ModelEnt, modelsTable } from '~backend/drizzle/postgres/schema/models';
import { ErEnum } from '~common/enums/er.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { ServerError } from '~common/models/server-error';

@Injectable()
export class ModelsService {
  constructor(@Inject(DRIZZLE) private db: Db) {}

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

    return model;
  }

  async getModelsY(item: {
    bridge: BridgeEnt;
    filterByModelIds: string[];
    addFields: boolean;
    addContent: boolean;
  }) {
    let { bridge, filterByModelIds, addFields, addContent } = item;

    let selectObj: any = {
      // 'modelFullId'
      structId: modelsTable.structId,
      modelId: modelsTable.modelId,
      type: modelsTable.type,
      // isStoreModel: modelsTable.isStoreModel,
      connectionId: modelsTable.connectionId,
      filePath: modelsTable.filePath,
      // 'content'
      isViewModel: modelsTable.isViewModel,
      accessRoles: modelsTable.accessRoles,
      label: modelsTable.label,
      gr: modelsTable.gr,
      hidden: modelsTable.hidden,
      // 'fields'
      nodes: modelsTable.nodes,
      description: modelsTable.description
      // 'server_ts'
    };

    let where = [eq(modelsTable.structId, bridge.structId)];

    if (isDefined(filterByModelIds) && filterByModelIds.length > 0) {
      where = [...where, inArray(modelsTable.modelId, filterByModelIds)];
    }

    if (addFields === true) {
      selectObj.fields = modelsTable.fields;

      // selectObj.push('fields');
    }

    if (addContent === true) {
      selectObj.content = modelsTable.content;
    }

    let models = (await this.db.drizzle
      .select(selectObj)
      .from(modelsTable)
      .where(and(...where))) as ModelEnt[];

    return models;
  }
}
