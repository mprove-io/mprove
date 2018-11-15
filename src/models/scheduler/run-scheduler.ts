import * as expressWs from 'express-ws';
import { interfaces } from '../../barrels/interfaces';
import { loopCheckChunks } from './loop-check-chunks';
import { loopCheckQueries } from './loop-check-queries';

export function runScheduler(item: {
  express_ws_instance: expressWs.Instance;
  ws_clients: interfaces.WebsocketClient[];
}) {
  loopCheckChunks(item);
  loopCheckQueries();
}
