import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { Project } from '~common/interfaces/backend/project';
import { BaseQuery } from './base.query';

export class ProjectState extends Project {}

let projectState: ProjectState = {
  orgId: undefined,
  projectId: undefined,
  name: undefined,
  defaultBranch: undefined,
  remoteType: undefined,
  gitUrl: undefined,
  publicKey: undefined,
  serverTs: 1
};

@Injectable({ providedIn: 'root' })
export class ProjectQuery extends BaseQuery<ProjectState> {
  orgId$ = this.store.pipe(select(state => state.orgId));
  projectId$ = this.store.pipe(select(state => state.projectId));
  name$ = this.store.pipe(select(state => state.name));

  constructor() {
    super(
      createStore({ name: 'project' }, withProps<ProjectState>(projectState))
    );
  }
}
