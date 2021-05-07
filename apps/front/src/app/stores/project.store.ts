import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { common } from '~front/barrels/common';

export class ProjectState {
  project: common.Project;
  members: common.Member[];
  userMember: common.Member;
}

function createInitialState(): ProjectState {
  return {
    project: {
      orgId: undefined,
      projectId: undefined,
      name: undefined,
      serverTs: 1
    },
    members: [],
    userMember: undefined
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
