import { createSelector } from '@ngrx/store';
import { getWebSocketState } from 'src/app/store/selectors/get-state/get-websocket-state';
import * as interfaces from 'src/app/interfaces/_index';

export const getWebSocketIsOpen = createSelector(
  getWebSocketState,
  (state: interfaces.WebSocketState) => state.is_open
);
