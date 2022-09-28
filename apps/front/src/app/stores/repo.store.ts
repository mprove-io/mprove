import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { common } from '~front/barrels/common';

export class RepoState extends common.Repo {}

@Injectable({ providedIn: 'root' })
@StoreConfig({
  name: 'repo',
  resettable: true
})
export class RepoStore extends Store<RepoState> {
  constructor() {
    super(<RepoState>{
      orgId: undefined,
      projectId: undefined,
      repoId: undefined,
      currentBranchId: undefined,
      repoStatus: undefined,
      conflicts: [],
      nodes: []
    });
  }
}
