import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrgState, OrgStore } from '../stores/org.store';
import { UserQuery } from './user.query';

@Injectable({ providedIn: 'root' })
export class OrgQuery extends Query<OrgState> {
  name$ = this.select(state => state.name);
  orgId$ = this.select(state => state.orgId);
  ownerEmail$ = this.select(state => state.ownerEmail);
  companySize$ = this.select(state => state.companySize);
  contactPhone$ = this.select(state => state.contactPhone);

  isOrgOwner$ = combineLatest([this.userQuery.email$, this.ownerEmail$]).pipe(
    map(([userEmail, ownerEmail]: [string, string]) => userEmail === ownerEmail)
  );

  constructor(protected store: OrgStore, private userQuery: UserQuery) {
    super(store);
  }
}
