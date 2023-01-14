import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { common } from '~front/barrels/common';
import { BaseQuery } from './base.query';

export class ApisState {
  apis: common.Rep[];
}

let apisState: ApisState = {
  apis: []
};

@Injectable({ providedIn: 'root' })
export class ApisQuery extends BaseQuery<ApisState> {
  apis$ = this.store.pipe(select(state => state.apis));

  constructor() {
    super(createStore({ name: 'apis' }, withProps<ApisState>(apisState)));
  }
}
