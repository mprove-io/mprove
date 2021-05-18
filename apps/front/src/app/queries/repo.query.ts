import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { RepoState, RepoStore } from '../stores/repo.store';

@Injectable({ providedIn: 'root' })
export class RepoQuery extends Query<RepoState> {
  constructor(protected store: RepoStore) {
    super(store);
  }
}
