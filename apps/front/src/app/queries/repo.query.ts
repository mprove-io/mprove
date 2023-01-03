import { Injectable } from '@angular/core';
import { createStore, withProps } from '@ngneat/elf';
import { common } from '~front/barrels/common';
import { BaseQuery } from './base.query';

export class RepoState extends common.Repo {}

let repoState: RepoState = {
  orgId: undefined,
  projectId: undefined,
  repoId: undefined,
  currentBranchId: undefined,
  repoStatus: undefined,
  conflicts: [],
  nodes: [],
  changesToCommit: [],
  changesToPush: []
};

@Injectable({ providedIn: 'root' })
export class RepoQuery extends BaseQuery<RepoState> {
  constructor() {
    super(createStore({ name: 'repo' }, withProps<RepoState>(repoState)));
  }
}
