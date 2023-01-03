import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { common } from '~front/barrels/common';
import { BaseQuery } from './base.query';

export class EvsState {
  evs: common.Ev[];
}

let evsState: EvsState = {
  evs: []
};

@Injectable({ providedIn: 'root' })
export class EvsQuery extends BaseQuery<EvsState> {
  evs$ = this.store.pipe(select(state => state.evs));

  constructor() {
    super(createStore({ name: 'evs' }, withProps<EvsState>(evsState)));
  }
}
