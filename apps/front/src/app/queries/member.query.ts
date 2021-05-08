import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { MemberState, MemberStore } from '../stores/member.store';

@Injectable({ providedIn: 'root' })
export class MemberQuery extends Query<MemberState> {
  isAdmin$ = this.select(state => state.isAdmin);
  isEditor$ = this.select(state => state.isEditor);
  isExplorer$ = this.select(state => state.isExplorer);

  constructor(protected store: MemberStore) {
    super(store);
  }
}
