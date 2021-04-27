import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { OrgState, OrgStore } from '../stores/org.store';

@Injectable({ providedIn: 'root' })
export class OrgQuery extends Query<OrgState> {
  name$ = this.select(state => state.name);
  ownerEmail$ = this.select(state => state.ownerEmail);
  companySize$ = this.select(state => state.companySize);
  contactPhone$ = this.select(state => state.contactPhone);

  constructor(protected store: OrgStore) {
    super(store);
  }
}
