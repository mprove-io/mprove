import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { common } from '~front/barrels/common';
import { BaseQuery } from './base.query';

export class VizsState {
  vizs: common.VizX[];
}

let vizsState: VizsState = {
  vizs: []
};

@Injectable({ providedIn: 'root' })
export class VizsQuery extends BaseQuery<VizsState> {
  vizs$ = this.store.pipe(select(state => state.vizs));

  constructor() {
    super(createStore({ name: 'vizs' }, withProps<VizsState>(vizsState)));
  }
}
