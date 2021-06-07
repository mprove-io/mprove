import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { common } from '~front/barrels/common';

export class MconfigState extends common.Mconfig {}

@Injectable({ providedIn: 'root' })
@StoreConfig({
  name: 'mconfig',
  resettable: true
})
export class MconfigStore extends Store<MconfigState> {
  constructor() {
    super(<MconfigState>{
      structId: undefined,
      mconfigId: undefined,
      queryId: undefined,
      modelId: undefined,
      select: [],
      sortings: [],
      sorts: undefined,
      timezone: undefined,
      limit: undefined,
      filters: [],
      charts: [],
      temp: true,
      serverTs: 1
    });
  }
}
