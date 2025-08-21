import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { combineLatest, map } from 'rxjs';
import { Org } from '~common/interfaces/backend/org';
import { BaseQuery } from './base.query';
import { UserQuery } from './user.query';

export class OrgState extends Org {}

let orgState: OrgState = {
  orgId: undefined,
  name: undefined,
  ownerId: undefined,
  ownerEmail: undefined,
  serverTs: 1
};

@Injectable({ providedIn: 'root' })
export class OrgQuery extends BaseQuery<OrgState> {
  name$ = this.store.pipe(select(state => state.name));
  orgId$ = this.store.pipe(select(state => state.orgId));
  ownerEmail$ = this.store.pipe(select(state => state.ownerEmail));

  isOrgOwner$ = combineLatest([this.userQuery.email$, this.ownerEmail$]).pipe(
    map(([userEmail, ownerEmail]: [string, string]) => userEmail === ownerEmail)
  );

  constructor(private userQuery: UserQuery) {
    super(createStore({ name: 'org' }, withProps<OrgState>(orgState)));
  }
}
