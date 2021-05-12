import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import {
  ConnectionsState,
  ConnectionsStore
} from '../stores/connections.store';

@Injectable({ providedIn: 'root' })
export class ConnectionsQuery extends Query<ConnectionsState> {
  connections$ = this.select(state => state.connections);
  total$ = this.select(state => state.total);

  constructor(protected store: ConnectionsStore) {
    super(store);
  }
}
