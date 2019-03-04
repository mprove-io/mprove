import * as interfaces from '@app/interfaces/_index';

export const getWebSocketState = (state: interfaces.AppState) =>
  state.webSocket;
