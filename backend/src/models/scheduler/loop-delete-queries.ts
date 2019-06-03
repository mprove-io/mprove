import { In, Not, LessThan } from 'typeorm';
import { entities } from '../../barrels/entities';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { store } from '../../barrels/store';
import { handler } from '../../barrels/handler';
import { config } from '../../barrels/config';

let cron = require('cron');

export function loopDeleteQueries() {
  let isCronJobRunning = false;

  let cronJob = new cron.CronJob('* * * * * *', async () => {
    if (!isCronJobRunning) {
      isCronJobRunning = true;

      try {
        await deleteQueries().catch(e =>
          helper.reThrow(e, enums.schedulerErrorsEnum.SCHEDULER_DELETE_QUERIES)
        );
      } catch (err) {
        handler.errorToLog(err);
      }

      isCronJobRunning = false;
    }
  });

  cronJob.start();
}

async function deleteQueries() {
  let storeRepos = store.getReposRepo();
  let storeQueries = store.getQueriesRepo();

  let repoParts = <entities.RepoEntity[]>await storeRepos
    .createQueryBuilder('repo')
    .select('repo.struct_id')
    .getMany()
    .catch(e =>
      helper.reThrow(e, enums.storeErrorsEnum.STORE_REPOS_QUERY_BUILDER)
    );

  let structIds = repoParts.map(x => x.struct_id);

  if (structIds.length > 0) {
    let currentTs = helper.makeTs();

    let tsInPast = Number(currentTs) - config.QUERIES_DELETE_CUTOFF;

    await storeQueries
      .createQueryBuilder()
      .delete()
      .where(`struct_id NOT IN (:...ids) AND server_ts < (:ts)`, {
        ids: structIds,
        ts: tsInPast
      })
      .execute()
      .catch(e =>
        helper.reThrow(e, enums.storeErrorsEnum.STORE_QUERIES_QUERY_BUILDER)
      );
  }
}
