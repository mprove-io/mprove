import * as WebSocket from 'ws';

export interface WebsocketClient {
  session_id: string;
  user_id: string;
  ws: WebSocket;
}
