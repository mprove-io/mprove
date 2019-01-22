import { In } from 'typeorm';
import { api } from '../../barrels/api';
import { entities } from '../../barrels/entities';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { proc } from '../../barrels/proc';
import { interfaces } from '../../barrels/interfaces';
import { store } from '../../barrels/store';
import { handler } from '../../barrels/handler';
import { wrapper } from '../../barrels/wrapper';
import * as WebSocket from 'ws';
import { getSessionsRepo } from '../store/_index';
import { config } from '../../barrels/config';

let cron = require('cron');

export function loopDeleteSessions(item: {
  ws_clients: interfaces.WebsocketClient[];
}) {
  let isCronJobRunning = false;

  let cronJob = new cron.CronJob('* * * * * *', async () => {
    if (isCronJobRunning) {
      console.log(`${loopDeleteSessions.name} skip`);
    }

    if (!isCronJobRunning) {
      isCronJobRunning = true;

      try {
        await deleteSessions(item).catch(e =>
          helper.reThrow(e, enums.schedulerErrorsEnum.SCHEDULER_DELETE_SESSIONS)
        );
      } catch (err) {
        handler.errorToLog(err);
      }

      isCronJobRunning = false;
    }
  });

  cronJob.start();
}

async function deleteSessions(item: {
  ws_clients: interfaces.WebsocketClient[];
}) {
  let currentTs = helper.makeTs();

  let tsInPast = Number(currentTs) - config.SESSION_LAST_PONG_CUTOFF;

  let storeSessions = store.getSessionsRepo();

  let sessions = <entities.SessionEntity[]>await storeSessions
    .createQueryBuilder()
    .select()
    .where(`last_pong_ts < (:ts)`, { ts: tsInPast })
    .getMany()
    .catch(e =>
      helper.reThrow(e, enums.storeErrorsEnum.STORE_SESSIONS_QUERY_BUILDER)
    );

  let sessionIds = sessions.map(x => x.session_id);

  if (sessionIds.length === 0) {
    return;
  }

  item.ws_clients.forEach(x => {
    if (sessionIds.indexOf(x.session_id) > -1) {
      x.ws.close(4502);
    }
  });

  let storeMessages = store.getMessagesRepo();

  await storeMessages
    .createQueryBuilder()
    .delete()
    .where(`session_id IN (:...ids)`, { ids: sessionIds })
    .execute()
    .catch(e =>
      helper.reThrow(e, enums.storeErrorsEnum.STORE_MESSAGES_QUERY_BUILDER)
    );

  await storeSessions
    .delete(sessionIds)
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_SESSIONS_DELETE));
}
