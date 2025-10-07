import { Injectable } from '@nestjs/common';
import {
  ModelEnx,
  ModelLt,
  ModelSt
} from '~backend/drizzle/postgres/enx/model-enx';
import { ModelEnt } from '~backend/drizzle/postgres/schema/models';
import { TabService } from './tab.service';

@Injectable()
export class WrapEntToEnxService {
  constructor(private tabService: TabService) {}

  wrapEntToEnxModel(model: ModelEnt): ModelEnx {
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
}
