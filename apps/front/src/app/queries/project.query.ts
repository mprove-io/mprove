import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  MemberExtended,
  ProjectState,
  ProjectStore
} from '../stores/project.store';
import { UserQuery } from './user.query';

@Injectable({ providedIn: 'root' })
export class ProjectQuery extends Query<ProjectState> {
  orgId$ = this.select(state => state.orgId);
  projectId$ = this.select(state => state.orgId);
  name$ = this.select(state => state.name);

  members$ = this.select(state =>
    state.members.sort((a: any, b: any) =>
      // sorted by memberId
      a.memberId > b.memberId ? 1 : b.memberId > a.memberId ? -1 : 0
    )
  );

  isAdmin$ = combineLatest([this.userQuery.userId$, this.members$]).pipe(
    map(
      ([userId, members]: [string, MemberExtended[]]) =>
        members
          .filter(x => x.isAdmin === true)
          .map(x => x.memberId)
          .indexOf(userId) > -1
    )
  );

  constructor(protected store: ProjectStore, private userQuery: UserQuery) {
    super(store);
  }
}
