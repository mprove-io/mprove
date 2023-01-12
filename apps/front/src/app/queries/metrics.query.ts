import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { common } from '~front/barrels/common';
import { BaseQuery } from './base.query';

export class MetricsState {
  metrics: common.MetricAny[];
}

let metricsState: MetricsState = {
  metrics: []
};

@Injectable({ providedIn: 'root' })
export class MetricsQuery extends BaseQuery<MetricsState> {
  metrics$ = this.store.pipe(select(state => state.metrics));

  constructor() {
    super(
      createStore({ name: 'metrics' }, withProps<MetricsState>(metricsState))
    );
  }
}
