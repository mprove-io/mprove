import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { AgentEventApi } from '#common/interfaces/backend/agent-event-api';
import { BaseQuery } from './base.query';

export class SessionEventsState {
  debugEvents: AgentEventApi[];
  liveEvents: AgentEventApi[];
}

let sessionEventsState: SessionEventsState = {
  debugEvents: [],
  liveEvents: []
};

@Injectable({ providedIn: 'root' })
export class SessionEventsQuery extends BaseQuery<SessionEventsState> {
  debugEvents$ = this.store.pipe(select(state => state.debugEvents));
  liveEvents$ = this.store.pipe(select(state => state.liveEvents));

  constructor() {
    super(
      createStore(
        { name: 'sessionEvents' },
        withProps<SessionEventsState>(sessionEventsState)
      )
    );
  }
}
