import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { common } from '~front/barrels/common';
import { BaseQuery } from './base.query';

export class NavState {
  avatarSmall: string;
  avatarBig: string;
  orgId: string;
  orgOwnerId: string;
  orgName: string;
  projectId: string;
  projectName: string;
  projectDefaultBranch: string;
  isRepoProd: boolean;
  branchId: string;
  envId: string;
  needValidate: boolean;
  serverTimeDiff: number;
}

let navState: NavState = {
  avatarSmall: undefined,
  avatarBig: undefined,
  orgId: undefined,
  orgOwnerId: undefined,
  orgName: undefined,
  projectId: undefined,
  projectName: undefined,
  projectDefaultBranch: undefined,
  isRepoProd: undefined,
  branchId: undefined,
  envId: common.PROJECT_ENV_PROD,
  needValidate: false,
  serverTimeDiff: undefined
};

@Injectable({ providedIn: 'root' })
export class NavQuery extends BaseQuery<NavState> {
  avatarSmall$ = this.store.pipe(select(state => state.avatarSmall));
  avatarBig$ = this.store.pipe(select(state => state.avatarBig));

  org$ = this.store.pipe(
    select(state => ({
      orgId: state.orgId,
      name: state.orgName
    }))
  );

  project$ = this.store.pipe(
    select(state => ({
      projectId: state.projectId,
      name: state.projectName,
      defaultBranch: state.projectDefaultBranch
    }))
  );

  projectId$ = this.store.pipe(select(state => state.projectId));
  orgId$ = this.store.pipe(select(state => state.orgId));
  isRepoProd$ = this.store.pipe(select(state => state.isRepoProd));
  branchId$ = this.store.pipe(select(state => state.branchId));

  constructor() {
    super(createStore({ name: 'nav' }, withProps<NavState>(navState)));
  }

  clearOrgAndDeps() {
    this.store.update(state =>
      Object.assign({}, state, <NavState>{
        orgId: undefined,
        orgName: undefined,
        orgOwnerId: undefined,
        projectId: undefined,
        projectName: undefined,
        projectDefaultBranch: undefined,
        isRepoProd: true,
        branchId: undefined
      })
    );
  }

  clearProjectAndDeps() {
    this.store.update(state =>
      Object.assign({}, state, <NavState>{
        projectId: undefined,
        projectName: undefined,
        projectDefaultBranch: undefined,
        isRepoProd: true,
        branchId: undefined
      })
    );
  }
}
