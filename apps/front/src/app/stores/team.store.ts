import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { common } from '~front/barrels/common';

function createInitialState(): common.Member[] {
  return [];
}

@Injectable({ providedIn: 'root' })
@StoreConfig({
  name: 'project',
  resettable: true
})
export class TeamStore extends Store<common.Member[]> {
  constructor() {
    super(createInitialState());
  }
}
