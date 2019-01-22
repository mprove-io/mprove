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

let cron = require('cron');

export function loopPing(item: { ws_clients: interfaces.WebsocketClient[] }) {
  let isCronJobRunning = false;

  let cronJob = new cron.CronJob('* * * * * *', async () => {
    if (isCronJobRunning) {
      console.log(`${loopPing.name} skip`);
    }

    if (!isCronJobRunning) {
      isCronJobRunning = true;

      try {
        await ping(item).catch(e =>
          helper.reThrow(e, enums.schedulerErrorsEnum.SCHEDULER_PING)
        );
      } catch (err) {
        handler.errorToLog(err);
      }

      isCronJobRunning = false;
    }
  });

  cronJob.start();
}

async function ping(item: { ws_clients: interfaces.WebsocketClient[] }) {
  let wsClientsOpen = item.ws_clients.filter(
    wsClient => wsClient.ws.readyState === WebSocket.OPEN
  );

  Promise.all(
    wsClientsOpen.map(async wsClient => {
      let messageId = helper.makeId();
      let payload = { empty: true };
      let content = wrapper.wrapWebsocketMessage({
        message_id: messageId,
        payload: payload,
        session_id: wsClient.session_id,
        action: api.ServerRequestToClientActionEnum.Ping
      });

      return helper
        .sendWsAsync({
          ws_client: wsClient,
          content: content
        })
        .catch(e => {
          try {
            helper.reThrow(e, enums.helperErrorsEnum.HELPER_SEND_WS_ASYNC);
          } catch (err) {
            handler.errorToLog(err);
          }
        });
    })
  ).catch(e => helper.reThrow(e, enums.otherErrorsEnum.PROMISE_ALL));
}
