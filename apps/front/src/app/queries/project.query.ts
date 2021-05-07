import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { ProjectState, ProjectStore } from '../stores/project.store';
import { UserQuery } from './user.query';

@Injectable({ providedIn: 'root' })
export class ProjectQuery extends Query<ProjectState> {
  orgId$ = this.select(state => state.project.orgId);
  projectId$ = this.select(state => state.project.orgId);
  name$ = this.select(state => state.project.name);

  members$ = this.select(state => state.members);

  isAdmin$ = this.select(state => state.userMember?.isAdmin);
  isEditor$ = this.select(state => state.userMember?.isEditor);
  isExplorer$ = this.select(state => state.userMember?.isExplorer);

  constructor(protected store: ProjectStore, private userQuery: UserQuery) {
    super(store);
  }
}
