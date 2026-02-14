import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { AgentEventApi } from '#common/interfaces/backend/agent-event-api';
import { BaseQuery } from './base.query';

export class SessionEventsState {
  events: AgentEventApi[];
}

let sessionEventsState: SessionEventsState = {
  events: []
};

@Injectable({ providedIn: 'root' })
export class SessionEventsQuery extends BaseQuery<SessionEventsState> {
  events$ = this.store.pipe(select(state => state.events));

  constructor() {
    super(
      createStore(
        { name: 'sessionEvents' },
        withProps<SessionEventsState>(sessionEventsState)
      )
    );
  }
}
