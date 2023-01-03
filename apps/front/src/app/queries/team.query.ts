import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { common } from '~front/barrels/common';
import { BaseQuery } from './base.query';

export class TeamState {
  members: common.Member[];
  total: number;
}

let teamState: TeamState = {
  members: [],
  total: 0
};

@Injectable({ providedIn: 'root' })
export class TeamQuery extends BaseQuery<TeamState> {
  members$ = this.store.pipe(select(state => state.members));
  total$ = this.store.pipe(select(state => state.total));

  constructor() {
    super(createStore({ name: 'team' }, withProps<TeamState>(teamState)));
  }
}
