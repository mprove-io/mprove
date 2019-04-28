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
import { forEach } from 'p-iteration';
const { BigQuery } = require('@google-cloud/bigquery');

let cron = require('cron');

export function loopStartTriggerSqlJob() {
  let isCronJobRunning = false;

  let cronJob = new cron.CronJob('30 * * * * *', async () => {
    if (!isCronJobRunning) {
      isCronJobRunning = true;

      try {
        await startTriggerSqlJob().catch(e =>
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

async function startTriggerSqlJob() {
  let storeRepos = store.getReposRepo();
  let storeQueries = store.getQueriesRepo();

  let repoParts = <entities.RepoEntity[]>await storeRepos
    .createQueryBuilder('repo')
    .select('repo.struct_id')
    .where(`repo.repo_id = :repoId`, { repoId: constants.PROD_REPO_ID })
    .getMany()
    .catch(e =>
      helper.reThrow(e, enums.storeErrorsEnum.STORE_REPOS_QUERY_BUILDER)
    );

  let prodStructIds = repoParts.map(x => x.struct_id);

  let prodPdtQueries: entities.QueryEntity[] = [];

  if (prodStructIds.length > 0) {
    prodPdtQueries = <entities.QueryEntity[]>await storeQueries
      .find({
        is_pdt: enums.bEnum.TRUE,
        struct_id: In(prodStructIds)
      })
      .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_QUERIES_FIND));
  }

  let startQueries = prodPdtQueries.filter(
    query =>
      query.pdt_trigger_sql &&
      !query.pdt_trigger_sql_bigquery_query_job_id &&
      query.status !== api.QueryStatusEnum.Waiting &&
      query.status !== api.QueryStatusEnum.Running
  );

  await forEach(startQueries, async query => {
    let storeProjects = store.getProjectsRepo();

    let project = <entities.ProjectEntity>await storeProjects
      .findOne({
        project_id: query.project_id
      })
      .catch(e =>
        helper.reThrow(e, enums.storeErrorsEnum.STORE_PROJECTS_FIND_ONE)
      );

    let bigquery = new BigQuery({
      projectId: project.bigquery_project,
      keyFilename: project.bigquery_credentials_file_path
    });

    let createQueryJobItem = <any>await bigquery
      .createQueryJob({
        destination: undefined,
        dryRun: false,
        useLegacySql: false,
        query: query.pdt_trigger_sql
      })
      .catch((e: any) => {
        query.pdt_trigger_sql_last_error_message = e.message;
      });

    if (createQueryJobItem) {
      let queryJob = createQueryJobItem[0];
      let createQueryJobApiResponse = createQueryJobItem[1];

      query.pdt_trigger_sql_bigquery_query_job_id = queryJob.id;
    }

    // update server_ts
    let newServerTs = helper.makeTs();

    query.server_ts = newServerTs;

    // save to database
    let connection = getConnection();

    await connection
      .transaction(async manager => {
        await store
          .save({
            manager: manager,
            records: {
              queries: [query]
            },
            server_ts: newServerTs,
            source_init_id: undefined
          })
          .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_SAVE));
      })
      .catch(e =>
        helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_TRANSACTION)
      );
  });
}
