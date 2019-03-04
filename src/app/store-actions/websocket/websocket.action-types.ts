import { ngrxType } from '@app/ngrx/ngrx-type';

export const CLOSE_WEBSOCKET = ngrxType('CLOSE_WEBSOCKET');
export const CLOSE_WEBSOCKET_SUCCESS = ngrxType('CLOSE_WEBSOCKET_SUCCESS');

export const OPEN_WEBSOCKET = ngrxType('OPEN_WEBSOCKET');
export const OPEN_WEBSOCKET_SUCCESS = ngrxType('OPEN_WEBSOCKET_SUCCESS');

export const PING_RECEIVED = ngrxType('PING_RECEIVED');

export const STATE_RECEIVED = ngrxType('STATE_RECEIVED');

export const UPDATE_WEBSOCKET_INIT_ID = ngrxType('UPDATE_WEBSOCKET_INIT_ID');
