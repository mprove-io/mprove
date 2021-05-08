import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { TeamState, TeamStore } from '../stores/team.store';

@Injectable({ providedIn: 'root' })
export class TeamQuery extends Query<TeamState> {
  members$ = this.select(state => state.members);
  total$ = this.select(state => state.total);

  constructor(protected store: TeamStore) {
    super(store);
  }
}
