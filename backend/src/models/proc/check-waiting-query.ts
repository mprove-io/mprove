import { getConnection, In } from 'typeorm';
import { api } from '../../barrels/api';
import { entities } from '../../barrels/entities';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { store } from '../../barrels/store';
import { runQueryWithoutDeps } from './run-query-without-deps';

export async function checkWaitingQuery(item: { query: entities.QueryEntity }) {
  let skipChunk = true;

  let query = item.query;

  let storeQueries = store.getQueriesRepo();

  let storeProjects = store.getProjectsRepo();

  let project = <entities.ProjectEntity>await storeProjects
    .findOne({
      project_id: query.project_id
    })
    .catch(e =>
      helper.reThrow(e, enums.storeErrorsEnum.STORE_PROJECTS_FIND_ONE)
    );

  let pdtDeps = JSON.parse(query.pdt_deps);

  let depQueries = <entities.QueryEntity[]>await storeQueries
    .find({
      pdt_id: In(pdtDeps)
    })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_QUERIES_FIND));

  let depQueriesCompletedAfterQueryLastRun = depQueries.filter(
    depQuery => Number(depQuery.last_complete_ts) > Number(query.last_run_ts)
  );

  let depQueriesCompletedAtLeastOnce = depQueries.filter(
    depQuery => Number(depQuery.last_complete_ts) > 1
  );

  let depQueryErrorAfterQueryLastRunTs = depQueries.find(
    depQuery => Number(depQuery.last_error_ts) > Number(query.last_run_ts)
  );

  if (
    query.refresh === enums.bEnum.TRUE &&
    depQueriesCompletedAfterQueryLastRun.length === depQueries.length
  ) {
    // all dep queries refreshed

    skipChunk = false;

    query = <entities.QueryEntity>await runQueryWithoutDeps({
      project: project,
      credentials_file_path: project.bigquery_credentials_file_path,
      bigquery_project: project.bigquery_project,
      user_id: query.last_run_by,
      query: query,
      new_last_run_ts: query.last_run_ts
    }).catch(e =>
      helper.reThrow(e, enums.procErrorsEnum.PROC_RUN_QUERY_WITHOUT_DEPS)
    );
  } else if (
    query.refresh === enums.bEnum.FALSE &&
    depQueriesCompletedAtLeastOnce.length === depQueries.length
  ) {
    // all dep queries completed

    skipChunk = false;

    query = <entities.QueryEntity>await runQueryWithoutDeps({
      project: project,
      credentials_file_path: project.bigquery_credentials_file_path,
      bigquery_project: project.bigquery_project,
      user_id: query.last_run_by,
      query: query,
      new_last_run_ts: query.last_run_ts
    }).catch(e =>
      helper.reThrow(e, enums.procErrorsEnum.PROC_RUN_QUERY_WITHOUT_DEPS)
    );
  } else if (depQueryErrorAfterQueryLastRunTs) {
    skipChunk = false;

    let newLastErrorTs = helper.makeTs();

    query.status = api.QueryStatusEnum.Error;
    query.refresh = null;
    query.last_error_message = 'required pdt(s) has error';
    query.last_error_ts = newLastErrorTs;
  } else {
    // nothing to do, waiting for next scheduler cycle
  }

  // update server_ts

  let newServerTs = helper.makeTs();

  if (!skipChunk) {
    query.server_ts = newServerTs;
  }

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
          skip_chunk: skipChunk,
          source_init_id: undefined
        })
        .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_SAVE));
    })
    .catch(e => helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_TRANSACTION));
}
