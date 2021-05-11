import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { NavState, NavStore } from '../stores/nav.store';

@Injectable({ providedIn: 'root' })
export class NavQuery extends Query<NavState> {
  avatarSmall$ = this.select(state => state.avatarSmall);
  avatarBig$ = this.select(state => state.avatarBig);

  org$ = this.select(state => ({
    orgId: state.orgId,
    name: state.orgName
  }));

  project$ = this.select(state => ({
    projectId: state.projectId,
    name: state.projectName
  }));

  projectId$ = this.select(state => state.projectId);
  orgId$ = this.select(state => state.orgId);

  constructor(protected store: NavStore) {
    super(store);
  }
}
