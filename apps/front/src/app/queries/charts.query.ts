import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import type { ChartUnit } from '#common/zod/backend/chart-unit';
import type { SpaceNode } from '#common/zod/backend/space-node';
import { BaseQuery } from './base.query';

export class ChartsState {
  chartUnitDrafts: ChartUnit[];
  chartSpaceNodes: SpaceNode[];
}

let chartsState: ChartsState = {
  chartUnitDrafts: [],
  chartSpaceNodes: []
};

@Injectable({ providedIn: 'root' })
export class ChartsQuery extends BaseQuery<ChartsState> {
  chartUnitDrafts$ = this.store.pipe(select(state => state.chartUnitDrafts));

  constructor() {
    super(createStore({ name: 'charts' }, withProps<ChartsState>(chartsState)));
  }
}
