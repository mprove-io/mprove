import { In, getConnection } from 'typeorm';
import { api } from '../../barrels/api';
import { entities } from '../../barrels/entities';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { proc } from '../../barrels/proc';
import { store } from '../../barrels/store';
import { handler } from '../../barrels/handler';
import { constants } from '../../barrels/constants';
import { interfaces } from '../../barrels/interfaces';

let cron = require('cron');

export function loopCheckPdtTime(pdtTimeJobs: interfaces.PdtTimeJob[]) {
  let isCronJobRunning = false;

  let cronJob = new cron.CronJob('* * * * * *', async () => {
    if (!isCronJobRunning) {
      isCronJobRunning = true;

      try {
        await checkPdtTime(pdtTimeJobs).catch(e =>
          helper.reThrow(e, enums.schedulerErrorsEnum.SCHEDULER_CHECK_PDT_TIME)
        );
      } catch (err) {
        handler.errorToLog(err);
      }

      isCronJobRunning = false;
    }
  });

  cronJob.start();
}

async function checkPdtTime(pdtTimeJobs: interfaces.PdtTimeJob[]) {
  let storeRepos = store.getReposRepo();

  let repoParts = <entities.RepoEntity[]>await storeRepos
    .createQueryBuilder('repo')
    .select('repo.struct_id')
    .where(`repo.repo_id = :repoId`, { repoId: constants.PROD_REPO_ID })
    .getMany()
    .catch(e =>
      helper.reThrow(e, enums.storeErrorsEnum.STORE_REPOS_QUERY_BUILDER)
    );

  let prodStructIds = repoParts.map(x => x.struct_id);

  let storeQueries = store.getQueriesRepo();

  let pdtQueries = <entities.QueryEntity[]>await storeQueries
    .find({
      is_pdt: enums.bEnum.TRUE
    })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_QUERIES_FIND));

  let changedQueries: entities.QueryEntity[] = [];

  // add jobs
  pdtQueries
    .filter(
      query =>
        prodStructIds.indexOf(query.struct_id) > -1 &&
        !!query.pdt_trigger_time &&
        !query.pdt_trigger_time_job_id
    )
    .forEach(query => {
      try {
        let cronJob = new cron.CronJob(query.pdt_trigger_time, async () => {
          try {
            await storeQueries
              .createQueryBuilder('query')
              .update()
              .set({ pdt_need_start_by_time: enums.bEnum.TRUE })
              .where('query_id = :queryId', { queryId: query.query_id })
              .execute()
              .catch(e =>
                helper.reThrow(
                  e,
                  enums.storeErrorsEnum.STORE_QUERIES_QUERY_BUILDER
                )
              );
          } catch (err) {
            handler.errorToLog(err);
          }
        });

        cronJob.start();

        let newJobId = helper.makeId();

        query.pdt_trigger_time_job_id = newJobId;

        changedQueries.push(query);

        pdtTimeJobs.push({
          pdt_time_job_id: newJobId,
          struct_id: query.struct_id,
          query_id: query.query_id,
          cron_job: cronJob
        });
      } catch (err) {
        handler.errorToLog(err);
      }
    });

  // remove jobs
  for (let i = pdtTimeJobs.length - 1; i >= 0; i--) {
    let timeJob = pdtTimeJobs[i];

    if (prodStructIds.indexOf(timeJob.struct_id) < 0) {
      timeJob.cron_job.stop();
      pdtTimeJobs.splice(i, 1);

      let query = pdtQueries.find(q => q.query_id === timeJob.query_id);

      if (query) {
        query.pdt_need_start_by_time = undefined;
        query.pdt_trigger_time_job_id = undefined;
        query.pdt_trigger_sql_value = undefined;
        changedQueries.push(query);
      }
    }
  }

  // save to database

  let connection = getConnection();

  await connection
    .transaction(async manager => {
      await store
        .save({
          manager: manager,
          records: {
            queries: changedQueries
          },
          server_ts: undefined,
          skip_chunk: true,
          source_init_id: undefined
        })
        .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_SAVE));
    })
    .catch(e => helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_TRANSACTION));
}
