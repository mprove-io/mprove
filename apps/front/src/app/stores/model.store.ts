import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { common } from '~front/barrels/common';

export class ModelState extends common.Model {}

@Injectable({ providedIn: 'root' })
@StoreConfig({
  name: 'model',
  resettable: true
})
export class ModelStore extends Store<ModelState> {
  constructor() {
    super(<ModelState>{
      structId: undefined,
      modelId: undefined,
      filePath: undefined,
      content: undefined,
      accessUsers: [],
      accessRoles: [],
      label: undefined,
      gr: undefined,
      hidden: false,
      fields: [],
      nodes: [],
      description: undefined,
      serverTs: undefined
    });
  }
}
