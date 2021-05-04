import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { MemberExtended, TeamState, TeamStore } from '../stores/team.store';
import { UserQuery } from './user.query';

@Injectable({ providedIn: 'root' })
export class TeamQuery extends Query<TeamState> {
  members$ = this.select(state =>
    state.members.sort((a: any, b: any) =>
      // sorted by memberId
      a.memberId > b.memberId ? 1 : b.memberId > a.memberId ? -1 : 0
    )
  );

  teamIsUserAdmin$ = combineLatest([
    this.userQuery.userId$,
    this.members$
  ]).pipe(
    map(
      ([userId, members]: [string, MemberExtended[]]) =>
        members
          .filter(x => x.isAdmin === true)
          .map(x => x.memberId)
          .indexOf(userId) > -1
    )
  );

  constructor(protected store: TeamStore, private userQuery: UserQuery) {
    super(store);
  }
}
