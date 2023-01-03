import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { common } from '~front/barrels/common';
import { BaseQuery } from './base.query';

export class ConnectionsState {
  connections: common.Connection[];
  total: number;
}

let connectionsState: ConnectionsState = {
  connections: [],
  total: 0
};

@Injectable({ providedIn: 'root' })
export class ConnectionsQuery extends BaseQuery<ConnectionsState> {
  connections$ = this.store.pipe(select(state => state.connections));
  total$ = this.store.pipe(select(state => state.total));

  constructor() {
    super(
      createStore(
        { name: 'connections' },
        withProps<ConnectionsState>(connectionsState)
      )
    );
  }
}
