import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { common } from '~front/barrels/common';
import { BaseQuery } from './base.query';

export class RepsState {
  reps: common.RepX[];
}

let repsState: RepsState = {
  reps: []
};

@Injectable({ providedIn: 'root' })
export class RepsQuery extends BaseQuery<RepsState> {
  reps$ = this.store.pipe(select(state => state.reps));

  constructor() {
    super(createStore({ name: 'reps' }, withProps<RepsState>(repsState)));
  }
}
