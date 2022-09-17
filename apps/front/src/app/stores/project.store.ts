import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { common } from '~front/barrels/common';

export class ProjectState extends common.Project {}

function createInitialState(): ProjectState {
  return {
    orgId: undefined,
    projectId: undefined,
    name: undefined,
    remoteType: undefined,
    gitUrl: undefined,
    publicKey: undefined,
    serverTs: 1
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({
  name: 'project',
  resettable: true
})
export class ProjectStore extends Store<ProjectState> {
  constructor() {
    super(createInitialState());
  }
}
