import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import type { Given } from '#common/types/backend/parts/given/given';
import { BaseQuery } from './base.query';

export class GivensState {
  givens: Given[];
}

let givensState: GivensState = {
  givens: []
};

@Injectable({ providedIn: 'root' })
export class GivensQuery extends BaseQuery<GivensState> {
  givens$ = this.store.pipe(select(state => state.givens));

  constructor() {
    super(createStore({ name: 'givens' }, withProps<GivensState>(givensState)));
  }
}
