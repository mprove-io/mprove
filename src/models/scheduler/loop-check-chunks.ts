import * as expressWs from 'express-ws';
import { entities } from '../../barrels/entities';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { interfaces } from '../../barrels/interfaces';
import { proc } from '../../barrels/proc';
import { store } from '../../barrels/store';
import { handler } from '../../barrels/handler';
import { config } from '../../barrels/config';
import * as WebSocket from 'ws';
import { In } from 'typeorm';

let cron = require('cron');

export function loopCheckChunks(item: {
  ws_clients: interfaces.WebsocketClient[];
}) {
  let isCronJobRunning = false;

  let cronJob = new cron.CronJob('* * * * * *', async () => {
    if (isCronJobRunning) {
      console.log(`${loopCheckChunks.name} skip`);
    }

    if (!isCronJobRunning) {
      isCronJobRunning = true;

      await checkChunks(item).catch(e => {
        try {
          helper.reThrow(e, enums.schedulerErrorsEnum.SCHEDULER_CHECK_CHUNKS);
        } catch (err) {
          handler.errorToLog(err);
        }
      });

      isCronJobRunning = false;
    }
  });

  cronJob.start();
}

async function checkChunks(item: { ws_clients: interfaces.WebsocketClient[] }) {
  let wsClientsOpen = item.ws_clients.filter(
    wsClient => wsClient.ws.readyState === WebSocket.OPEN
  );

  // get fresh chunks with age < some seconds in past

  let currentTs = helper.makeTs();
  let tsInPast = Number(currentTs) - config.CHUNK_CUTOFF;

  let storeChunks = store.getChunksRepo();

  let freshChunkParts = <entities.ChunkEntity[]>await storeChunks
    .createQueryBuilder('chunk')
    .select('chunk.chunk_id')
    .where(`chunk.server_ts > (:ts)`, { ts: tsInPast })
    .getMany()
    .catch(e =>
      helper.reThrow(e, enums.storeErrorsEnum.STORE_CHUNKS_QUERY_BUILDER)
    );

  let freshChunkIds = freshChunkParts.map(part => part.chunk_id);

  if (freshChunkIds.length === 0) {
    return;
  }

  // what fresh chunks were already processed for which sessions

  let storeChunkSessions = store.getChunkSessionsRepo();

  let processedChunkSessions = <entities.ChunkSessionEntity[]>(
    await storeChunkSessions
      .createQueryBuilder('chunk_session')
      .where('chunk_session.chunk_id IN (:...chunkIds)', {
        chunkIds: freshChunkIds
      })
      .getMany()
      .catch(e =>
        helper.reThrow(e, enums.storeErrorsEnum.CHUNK_SESSION_QUERY_BUILDER)
      )
  );

  let processedChunkSessionMap: interfaces.ChunkSessionsMap = {};

  processedChunkSessions.forEach(x => {
    if (processedChunkSessionMap[x.chunk_id]) {
      processedChunkSessionMap[x.chunk_id].push(x.session_id);
    } else {
      processedChunkSessionMap[x.chunk_id] = [x.session_id];
    }
  });

  // what fresh chunk must be processed for which session

  let newChunkSessionsMap: interfaces.ChunkSessionsMap = {};

  freshChunkIds.forEach(chunkId => {
    wsClientsOpen.forEach(wsClient => {
      if (
        !processedChunkSessionMap[chunkId] ||
        processedChunkSessionMap[chunkId].indexOf(wsClient.session_id) < 0
      ) {
        if (newChunkSessionsMap[chunkId]) {
          newChunkSessionsMap[chunkId].push(wsClient.session_id);
        } else {
          newChunkSessionsMap[chunkId] = [wsClient.session_id];
        }
      }
    });
  });

  let newChunkIds = Object.keys(newChunkSessionsMap);

  if (newChunkIds.length === 0) {
    return;
  }

  let chunks = <entities.ChunkEntity[]>(
    await storeChunks
      .find({ chunk_id: In(newChunkIds) })
      .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_CHUNKS_FIND))
  );

  await Promise.all(
    chunks.map(async chunk =>
      proc
        .splitChunk({
          ws_clients_open: wsClientsOpen.filter(
            wsClientOpen =>
              newChunkSessionsMap[chunk.chunk_id].indexOf(
                wsClientOpen.session_id
              ) > -1
          ),
          chunk: chunk
        })
        .catch(e => {
          try {
            helper.reThrow(e, enums.procErrorsEnum.PROC_SPLIT_CHUNK);
          } catch (err) {
            handler.errorToLog(err);
          }
        })
    )
  ).catch(error => {
    handler.errorToLog(error);
  });
}
