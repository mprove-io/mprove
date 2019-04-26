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

let cron = require('cron');

export function loopStartPdt() {
  let isCronJobRunning = false;

  let cronJob = new cron.CronJob('* * * * * *', async () => {
    if (!isCronJobRunning) {
      isCronJobRunning = true;

      try {
        await startPdt().catch(e =>
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

async function startPdt() {
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

  let prodPdtQueries = <entities.QueryEntity[]>await storeQueries
    .find({
      is_pdt: enums.bEnum.TRUE,
      struct_id: In(prodStructIds)
    })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_QUERIES_FIND));

  let changedQueries: entities.QueryEntity[] = [];

  let startQueries = prodPdtQueries.filter(
    query =>
      (!!query.pdt_trigger_time || !!query.pdt_trigger_sql) &&
      query.status !== api.QueryStatusEnum.Waiting &&
      query.status !== api.QueryStatusEnum.Running
  );

  await forEach(startQueries, async query => {
    if (
      !query.pdt_trigger_time ||
      (!!query.pdt_trigger_time &&
        query.pdt_need_start_by_time === enums.bEnum.TRUE)
    ) {
      let start = false;

      if (!query.pdt_trigger_sql) {
        start = true;
        // set query time false
      } else {
        // check trigger_sql before start
        // if () {
        //   start = true;
        //  // set new query trigger sql value
        // }
      }

      if (start) {
        let storeProjects = store.getProjectsRepo();

        let project = <entities.ProjectEntity>await storeProjects
          .findOne({
            project_id: query.project_id
          })
          .catch(e =>
            helper.reThrow(e, enums.storeErrorsEnum.STORE_PROJECTS_FIND_ONE)
          );

        let newLastRunTs = helper.makeTs();

        let checkedQueryIds: string[] = [];

        let depQueries = await (<Promise<entities.QueryEntity[]>>proc
          .runQuery({
            all_dep_queries: allDepQueries,
            checked_query_ids: checkedQueryIds,
            is_top: true,
            query: query,
            new_last_run_ts: newLastRunTs,
            bigquery_project: project.bigquery_project,
            credentials_file_path: project.bigquery_credentials_file_path,
            user_id: null,
            refresh: false
          })
          .catch(e => helper.reThrow(e, enums.procErrorsEnum.PROC_RUN_QUERY)));

        // update server_ts
        let newServerTs = helper.makeTs();

        depQueries = helper.refreshServerTs(depQueries, newServerTs);

        // save to database
        let connection = getConnection();

        if (depQueries.length > 0) {
          await connection
            .transaction(async manager => {
              await store
                .save({
                  manager: manager,
                  records: {
                    queries: depQueries
                  },
                  server_ts: newServerTs,
                  source_init_id: undefined
                })
                .catch(e =>
                  helper.reThrow(e, enums.storeErrorsEnum.STORE_SAVE)
                );
            })
            .catch(e =>
              helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_TRANSACTION)
            );
        }
      }
    }
  });
}
