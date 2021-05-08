import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { ProjectState, ProjectStore } from '../stores/project.store';

@Injectable({ providedIn: 'root' })
export class ProjectQuery extends Query<ProjectState> {
  orgId$ = this.select(state => state.orgId);
  projectId$ = this.select(state => state.projectId);
  name$ = this.select(state => state.name);

  constructor(protected store: ProjectStore) {
    super(store);
  }
}
