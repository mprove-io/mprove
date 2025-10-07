import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { ModelEnx, modelsTable } from '~backend/drizzle/postgres/schema/models';
import { ErEnum } from '~common/enums/er.enum';
import { isUndefined } from '~common/functions/is-undefined';
import { ServerError } from '~common/models/server-error';
import { WrapToEnxService } from './wrap-to-enx.service';

@Injectable()
export class ModelsService {
  constructor(
    private wrapToEnxService: WrapToEnxService,
    @Inject(DRIZZLE) private db: Db
  ) {}

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
