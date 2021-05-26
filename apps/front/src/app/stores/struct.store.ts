import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { common } from '~front/barrels/common';

export class StructState extends common.Struct {}

@Injectable({ providedIn: 'root' })
@StoreConfig({
  name: 'struct',
  resettable: true
})
export class StructStore extends Store<StructState> {
  constructor() {
    super(<StructState>{
      projectId: undefined,
      structId: undefined,
      weekStart: undefined,
      allowTimezones: false,
      defaultTimezone: undefined,
      errors: [],
      views: [],
      udfsDict: undefined,
      serverTs: undefined
    });
  }
}
