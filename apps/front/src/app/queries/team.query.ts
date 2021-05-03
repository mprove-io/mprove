import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { common } from '~front/barrels/common';
import { TeamStore } from '../stores/team.store';

@Injectable({ providedIn: 'root' })
export class TeamQuery extends Query<common.Member[]> {
  members$ = this.select(state =>
    state.sort((a: any, b: any) =>
      // sorted by memberId
      a.memberId > b.memberId ? 1 : b.memberId > a.memberId ? -1 : 0
    )
  );

  constructor(protected store: TeamStore) {
    super(store);
  }
}
