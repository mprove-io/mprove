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
import { forEach } from 'p-iteration';

let cron = require('cron');

export function loopResendMessage(item: {
  ws_clients: interfaces.WebsocketClient[];
}) {
  let isCronJobRunning = false;

  let cronJob = new cron.CronJob('* * * * * *', async () => {
    if (!isCronJobRunning) {
      isCronJobRunning = true;

      try {
        await resendMessage(item).catch(e =>
          helper.reThrow(e, enums.schedulerErrorsEnum.SCHEDULER_RESEND_MESSAGE)
        );
      } catch (err) {
        handler.errorToLog(err);
      }

      isCronJobRunning = false;
    }
  });

  cronJob.start();
}

async function resendMessage(item: {
  ws_clients: interfaces.WebsocketClient[];
}) {
  let wsClientsOpen = item.ws_clients.filter(
    wsClient => wsClient.ws.readyState === WebSocket.OPEN
  );

  let sessionIds = wsClientsOpen.map(x => x.session_id);

  if (sessionIds.length === 0) {
    return;
  }

  let storeMessages = store.getMessagesRepo();

  let messages = <entities.MessageEntity[]>await storeMessages
    .find({
      where: {
        is_sent: enums.bEnum.FALSE,
        session_id: In(sessionIds)
      },
      order: {
        chunk_server_ts: 'ASC'
      }
    })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_MESSAGES_FIND));

  Promise.all(
    wsClientsOpen.map(async wsClient => {
      let sessionMessages = messages.filter(
        x => x.session_id === wsClient.session_id
      );

      await forEach(sessionMessages, async message => {
        let isSent = enums.bEnum.FALSE;

        await helper
          .sendWsAsync({
            ws_client: wsClient,
            content: message.content
          })
          .then(() => {
            isSent = enums.bEnum.TRUE;
          })
          .catch(e => {
            try {
              helper.reThrow(e, enums.helperErrorsEnum.HELPER_SEND_WS_ASYNC);
            } catch (err) {
              handler.errorToLog(err);
            }
          })
          .then(async () => {
            message.is_sent = isSent;
            message.last_send_attempt_ts = helper.makeTs();

            return storeMessages
              .save(message)
              .catch(err =>
                helper.reThrow(err, enums.storeErrorsEnum.STORE_MESSAGES_SAVE)
              );
          });
      });
    })
  ).catch(e => helper.reThrow(e, enums.otherErrorsEnum.PROMISE_ALL));
}
