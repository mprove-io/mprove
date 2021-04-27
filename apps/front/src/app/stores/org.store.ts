import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { common } from '~front/barrels/common';

export class OrgState extends common.Org {}

function createInitialState(): OrgState {
  return {
    orgId: undefined,
    name: undefined,
    ownerId: undefined,
    ownerEmail: undefined,
    companySize: undefined,
    contactPhone: undefined,
    serverTs: 1
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({
  name: 'org',
  resettable: true
})
export class OrgStore extends Store<OrgState> {
  constructor() {
    super(createInitialState());
  }
}
