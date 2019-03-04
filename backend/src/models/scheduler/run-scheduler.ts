import * as expressWs from 'express-ws';
import { interfaces } from '../../barrels/interfaces';
import { loopCheckChunks } from './loop-check-chunks';
import { loopCheckQueries } from './loop-check-queries';
import { loopPing } from './loop-ping';
import { loopDeleteSessions } from './loop-delete-sessions';
import { loopResendMessage } from './loop-resend-message';
import { loopCheckDemo } from './loop-check-demo';
import { loopDeleteProjects } from './loop-delete-projects';
import { loopDeleteUsers } from './loop-delete-users';
import { loopDeleteMembers } from './loop-delete-members';
import { loopDeleteQueries } from './loop-delete-queries';

export function runScheduler(item: {
  ws_clients: interfaces.WebsocketClient[];
}) {
  loopCheckChunks(item);
  loopCheckQueries();
  loopPing(item);
  loopDeleteSessions(item);
  loopResendMessage(item);
  loopCheckDemo();
  loopDeleteProjects();
  loopDeleteUsers();
  loopDeleteMembers();
  loopDeleteQueries();
}
