import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { common } from '~front/barrels/common';

export class MemberExtended extends common.Member {
  fullName?: string;
}

export class ProjectState extends common.Project {
  members: MemberExtended[];
}

function createInitialState(): ProjectState {
  return {
    orgId: undefined,
    projectId: undefined,
    name: undefined,
    members: [],
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
