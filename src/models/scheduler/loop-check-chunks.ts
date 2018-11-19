import * as expressWs from 'express-ws';
import { MoreThan } from 'typeorm';
import { entities } from '../../barrels/entities';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { interfaces } from '../../barrels/interfaces';
import { proc } from '../../barrels/proc';
import { store } from '../../barrels/store';

let cron = require('cron');

export function loopCheckChunks(item: {
  express_ws_instance: expressWs.Instance;
  ws_clients: interfaces.WebsocketClient[];
}) {
  let isCronJobRunning = false;

  let cronJob = new cron.CronJob('* * * * * *', async () => {
    if (isCronJobRunning) {
      console.log(`${loopCheckChunks.name} skip`);
    }

    if (!isCronJobRunning) {
      isCronJobRunning = true;

      // console.log(`${loopCheckChunks.name} start`);

      try {
        await checkChunks(item).catch(e =>
          helper.reThrow(e, enums.schedulerErrorsEnum.SCHEDULER_CHECK_CHUNKS)
        );
      } catch (e) {
        console.log(e);
        console.log('stackIndex2: ', e.stackArrayElementIndex2, '\n');
      }

      // console.log(`${loopCheckChunks.name} complete`);

      isCronJobRunning = false;
    }
  });

  cronJob.start();
}

async function checkChunks(item: {
  express_ws_instance: expressWs.Instance;
  ws_clients: interfaces.WebsocketClient[];
}) {
  let currentTs = helper.makeTs();

  let storeChunks = store.getChunksRepo();

  let chunks = <entities.ChunkEntity[]>await storeChunks
    .find({
      server_ts: <any>MoreThan(Number(currentTs) - 10 * 1000) // 10 seconds in past
    })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_CHUNKS_FIND));

  Promise.all(
    chunks.map(async chunk =>
      proc
        .splitChunk({
          express_ws_instance: item.express_ws_instance,
          ws_clients: item.ws_clients,
          chunk: chunk
        })
        .catch(e => helper.reThrow(e, enums.procErrorsEnum.PROC_SPLIT_CHUNK))
    )
  ).catch(e => {
    console.log(e);
  });
}
