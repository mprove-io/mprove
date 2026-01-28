import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { Member } from '#common/interfaces/backend/member';
import { BaseQuery } from './base.query';

export class MemberState extends Member {}

let memberState: MemberState = {
  projectId: undefined,
  memberId: undefined,
  email: undefined,
  alias: undefined,
  firstName: undefined,
  lastName: undefined,
  fullName: undefined,
  avatarSmall: undefined,
  roles: undefined,
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
