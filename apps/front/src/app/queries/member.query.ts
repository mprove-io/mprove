import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { common } from '~front/barrels/common';
import { BaseQuery } from './base.query';

export class MemberState extends common.Member {}

let memberState: MemberState = {
  projectId: undefined,
  memberId: undefined,
  email: undefined,
  alias: undefined,
  firstName: undefined,
  lastName: undefined,
  fullName: undefined,
  avatarSmall: undefined,
  timezone: undefined,
  roles: undefined,
  envs: undefined,
  isAdmin: undefined,
  isEditor: undefined,
  isExplorer: undefined,
  serverTs: 1
};

@Injectable({ providedIn: 'root' })
export class MemberQuery extends BaseQuery<MemberState> {
  isAdmin$ = this.store.pipe(select(state => state.isAdmin));
  isEditor$ = this.store.pipe(select(state => state.isEditor));
  isExplorer$ = this.store.pipe(select(state => state.isExplorer));

  constructor() {
    super(createStore({ name: 'member' }, withProps<MemberState>(memberState)));
  }
}
