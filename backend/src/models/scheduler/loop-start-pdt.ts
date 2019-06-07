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
import { forEachSeries } from 'p-iteration';
const { BigQuery } = require('@google-cloud/bigquery');

let cron = require('cron');

export function loopStartPdt() {
  let isCronJobRunning = false;

  let cronJob = new cron.CronJob('0 * * * * *', async () => {
    if (!isCronJobRunning) {
      isCronJobRunning = true;

      try {
        await startPdt().catch(e =>
          helper.reThrow(e, enums.schedulerErrorsEnum.SCHEDULER_START_PDT)
        );
      } catch (err) {
        handler.errorToLog(err);
      }

      isCronJobRunning = false;
    }
  });

  cronJob.start();
}

async function startPdt() {
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
      (query.pdt_trigger_time || query.pdt_trigger_sql) &&
      query.status !== api.QueryStatusEnum.Waiting &&
      query.status !== api.QueryStatusEnum.Running
  );

  await forEachSeries(startQueries, async query => {
    if (
      (!query.pdt_trigger_time &&
        query.pdt_need_start_by_trigger_sql === enums.bEnum.TRUE) ||
      (!query.pdt_trigger_sql &&
        query.pdt_need_start_by_time === enums.bEnum.TRUE) ||
      (query.pdt_need_start_by_trigger_sql === enums.bEnum.TRUE &&
        query.pdt_need_start_by_time === enums.bEnum.TRUE)
    ) {
      // start pdt
      query.pdt_need_start_by_time = null;
      query.pdt_need_start_by_trigger_sql = null;

      let storeProjects = store.getProjectsRepo();

      let project = <entities.ProjectEntity>await storeProjects
        .findOne({
          project_id: query.project_id
        })
        .catch(e =>
          helper.reThrow(e, enums.storeErrorsEnum.STORE_PROJECTS_FIND_ONE)
        );

      let depsAllQueryIds = JSON.parse(query.pdt_deps_all);

      let allDepQueries: entities.QueryEntity[] = [];

      if (depsAllQueryIds.length > 0) {
        allDepQueries = <entities.QueryEntity[]>await storeQueries
          .find({
            pdt_id: In(depsAllQueryIds)
          })
          .catch(e =>
            helper.reThrow(e, enums.storeErrorsEnum.STORE_QUERIES_FIND)
          );
      }

      let newLastRunTs = helper.makeTs();

      let depQueries = await (<Promise<entities.QueryEntity[]>>proc
        .runQuery({
          project: project,
          all_dep_queries: allDepQueries,
          checked_query_ids: [],
          is_top: true,
          query: query,
          new_last_run_ts: newLastRunTs,
          bigquery_project: project.bigquery_project,
          credentials_file_path: project.bigquery_credentials_file_path,
          user_id: null,
          refresh: false
        })
        .catch(e => helper.reThrow(e, enums.procErrorsEnum.PROC_RUN_QUERY)));

      let queries = depQueries && depQueries.length > 0 ? depQueries : [query];

      // update server_ts
      let newServerTs = helper.makeTs();

      queries = helper.refreshServerTs(queries, newServerTs);

      // save to database
      let connection = getConnection();

      await connection
        .transaction(async manager => {
          await store
            .save({
              manager: manager,
              records: {
                queries: queries
              },
              server_ts: newServerTs,
              source_init_id: undefined
            })
            .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_SAVE));
        })
        .catch(e =>
          helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_TRANSACTION)
        );
    }
  });
}
