import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { Connection } from '~common/interfaces/backend/connection';
import { BaseQuery } from './base.query';

export class ConnectionsState {
  connections: Connection[];
}

let connectionsState: ConnectionsState = {
  connections: []
};

@Injectable({ providedIn: 'root' })
export class ConnectionsQuery extends BaseQuery<ConnectionsState> {
  connections$ = this.store.pipe(select(state => state.connections));

  constructor() {
    super(
      createStore(
        { name: 'connections' },
        withProps<ConnectionsState>(connectionsState)
      )
    );
  }
}
