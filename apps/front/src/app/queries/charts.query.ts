import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { common } from '~front/barrels/common';
import { BaseQuery } from './base.query';

export class ChartsState {
  vizs: common.ChartX[];
}

let chartsState: ChartsState = {
  vizs: []
};

@Injectable({ providedIn: 'root' })
export class ChartsQuery extends BaseQuery<ChartsState> {
  vizs$ = this.store.pipe(select(state => state.vizs));

  constructor() {
    super(createStore({ name: 'vizs' }, withProps<ChartsState>(chartsState)));
  }
}
