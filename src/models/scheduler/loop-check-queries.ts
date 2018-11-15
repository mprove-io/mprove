import { In } from 'typeorm';
import { api } from '../../barrels/api';
import { entities } from '../../barrels/entities';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { proc } from '../../barrels/proc';
import { store } from '../../barrels/store';

let cron = require('cron');

export function loopCheckQueries() {
  let isCronJobRunning = false;

  let cronJob = new cron.CronJob('* * * * * *', async () => {
    if (isCronJobRunning) {
      console.log(`${loopCheckQueries.name} skip`);
    }

    if (!isCronJobRunning) {
      isCronJobRunning = true;

      // console.log(`${loopCheckQueries.name} start`);

      try {
        await checkQueries().catch(e =>
          helper.reThrow(e, enums.schedulerErrorsEnum.SCHEDULER_CHECK_QUERIES)
        );
      } catch (e) {
        // TODO: scheduler error handling policy
        console.log(e);
        console.log('stackIndex2: ', e.stackArrayElementIndex2, '\n');
      }

      // console.log(`${loopCheckQueries.name} complete`);

      isCronJobRunning = false;
    }
  });

  cronJob.start();
}

async function checkQueries() {
  let storeQueries = store.getQueriesRepo();

  let queries = <entities.QueryEntity[]>await storeQueries
    .find({
      status: In([api.QueryStatusEnum.Running, api.QueryStatusEnum.Waiting])
    })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_QUERIES_FIND));

  let runningQueries = queries.filter(
    query => query.status === api.QueryStatusEnum.Running
  );
  let waitingQueries = queries.filter(
    query => query.status === api.QueryStatusEnum.Waiting
  );

  Promise.all(
    runningQueries.map(async query =>
      proc
        .checkRunningQuery({
          query: query
        })
        .catch(e =>
          helper.reThrow(e, enums.procErrorsEnum.PROC_PROCESS_RUNNING_QUERY)
        )
    )
  ).catch(e => helper.reThrow(e, enums.otherErrorsEnum.PROMISE_ALL));

  Promise.all(
    waitingQueries.map(async query =>
      proc
        .checkWaitingQuery({
          query: query
        })
        .catch(e =>
          helper.reThrow(e, enums.procErrorsEnum.PROC_PROCESS_WAITING_QUERY)
        )
    )
  ).catch(e => helper.reThrow(e, enums.otherErrorsEnum.PROMISE_ALL));
}
