import { ChildProcess } from 'child_process';
import * as cluster from 'cluster';
import { enums } from './barrels/enums';
import { genSql } from './barrels/gen-sql';
import { interfaces } from './barrels/interfaces';
import { createExpress } from './create-express';
import { redisClient } from './redis-client';
import { ServerOutcomes } from './server-outcomes';
import { ServerProErrors } from './server-pro-errors';
import { ServerWorkers } from './server-workers';

redisClient.on('ready', () => {
});

redisClient.on('error', () => {
  console.log('Error in Redis');
});

// CLUSTER IS MASTER

if (cluster.isMaster) {
  let numWorkers: number;

  if (process.env.JEST || process.env.STRUCT) {
    numWorkers = 0;
  } else {
    createExpress();

    numWorkers = process.env.WORKERS ? Number(process.env.WORKERS) : 0;
  }

  // fork workers
  for (let i = 0; i < numWorkers; i++) {
    let worker: ChildProcess = cluster.fork().process;

    listenToWorker(worker);
  }

  // if worker gets disconnected, start new one.
  cluster.on('disconnect', worker => {
    console.error('Worker disconnect: ' + worker.id);

    let newWorker = cluster.fork().process;

    listenToWorker(newWorker);
  });

  cluster.on('online', worker => {
    console.log('New worker is online. worker: ' + worker.id);
  });
}

// CLUSTER IS WORKER

if (cluster.isWorker) {
  process.on('message', async (message: interfaces.ProcessMessage) => {
    try {
      switch (message.type) {
        case enums.ProEnum.GEN_BQ_VIEWS_PRO: {
          let taskItem = await redisClient.get(message.task_id);
          await redisClient.del(message.task_id);

          let taskItemParsed = JSON.parse(taskItem);

          let outcome = genSql.genBqViewsPro(taskItemParsed);

          await redisClient.set(message.outcome_id, JSON.stringify(outcome));

          process.send({
            type: enums.ProEnum.OUTCOME,
            outcome_id: message.outcome_id,
            task_id: message.task_id
          });

          break;
        }
      }
    } catch (error) {
      process.send({
        type: enums.ProEnum.ERROR,
        outcome_id: message.outcome_id,
        task_id: message.task_id,
        error: JSON.stringify(error, Object.getOwnPropertyNames(error))
      });
    }
  });
}

function listenToWorker(worker: ChildProcess) {
  console.log('worker started. process id %s', worker.pid);

  worker.on('message', async (message: interfaces.ProcessMessage) => {
    switch (message.type) {
      case enums.ProEnum.OUTCOME: {
        let outcomeItem = await redisClient.get(message.outcome_id);

        await redisClient.del(message.outcome_id);

        let outcomeItemParsed = JSON.parse(outcomeItem);

        ServerOutcomes.set(message.outcome_id, outcomeItemParsed);

        ServerWorkers.delete(worker.pid);

        break;
      }

      case enums.ProEnum.ERROR: {
        ServerProErrors.set(message.outcome_id, JSON.parse(message.error));

        ServerOutcomes.set(message.outcome_id, enums.ProEnum.PRO_ERROR);

        ServerWorkers.delete(worker.pid);
      }
    }
  });
}
