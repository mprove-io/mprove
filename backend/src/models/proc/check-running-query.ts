import { getConnection } from 'typeorm';
import { api } from '../../barrels/api';
import { config } from '../../barrels/config';
import { entities } from '../../barrels/entities';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { store } from '../../barrels/store';

const { BigQuery } = require('@google-cloud/bigquery');

export async function checkRunningQuery(item: { query: entities.QueryEntity }) {
  let skipChunk = true;

  let query = item.query;

  let storeQueries = store.getQueriesRepo();

  let credentialsFilePath = `${config.DISK_BACKEND_BIGQUERY_CREDENTIALS_PATH}/${
    query.project_id
  }.json`;

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
    keyFilename: credentialsFilePath
  });

  if (query.bigquery_is_copying === enums.bEnum.TRUE) {
    query = <entities.QueryEntity>await checkCopyingQuery({
      bigquery: bigquery,
      query: query
    }).catch(e =>
      helper.reThrow(e, enums.procErrorsEnum.PROC_CHECK_COPYING_QUERY)
    );
  } else {
    query = <entities.QueryEntity>await checkNotCopyingQuery({
      bigquery: bigquery,
      query: query
    }).catch(e =>
      helper.reThrow(e, enums.procErrorsEnum.PROC_CHECK_NOT_COPYING_QUERY)
    );
  }

  // update server_ts

  let newServerTs = helper.makeTs();

  if (query.status !== api.QueryStatusEnum.Running) {
    skipChunk = false;
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

async function checkCopyingQuery(item: {
  bigquery: any;
  query: entities.QueryEntity;
}) {
  let bigquery = item.bigquery;
  let query = item.query;

  let bigqueryCopyJob = bigquery.job(query.bigquery_copy_job_id);

  let itemCopyJob = await bigqueryCopyJob
    .get()
    .catch((e: any) =>
      helper.reThrow(e, enums.bigqueryErrorsEnum.BIGQUERY_JOB_GET)
    );

  let copyJob = itemCopyJob[0];
  let copyJobGetResponse = itemCopyJob[1];

  if (copyJobGetResponse.status.state === 'DONE') {
    if (copyJobGetResponse.status.errorResult) {
      // COPY FAIL

      let newLastErrorTs = helper.makeTs();

      let errorResult = copyJobGetResponse.status.errorResult;

      query.status = api.QueryStatusEnum.Error;
      query.refresh = null;
      query.bigquery_is_copying = enums.bEnum.FALSE;
      query.last_error_message =
        `Create PDT fail. ` +
        `Message: '${errorResult.message}'. ` +
        `Reason: '${errorResult.reason}'. ` +
        `Location: '${errorResult.location}'.`;
      query.last_error_ts = newLastErrorTs;
    } else {
      // COPY SUCCESS

      let newLastCompleteTs = helper.makeTs();

      query.status = api.QueryStatusEnum.Completed;
      query.refresh = null;
      query.bigquery_is_copying = enums.bEnum.FALSE;
      query.last_complete_ts = newLastCompleteTs;

      // delete copied table

      let bigqueryTable = bigquery
        .dataset(`mprove_${query.project_id}`)
        .table(`${query.pdt_id}_${query.query_id}`);

      let itemTableDelete = await bigqueryTable
        .delete()
        .catch((e: any) =>
          helper.reThrow(e, enums.bigqueryErrorsEnum.BIGQUERY_TABLE_DELETE)
        );
    }
  }

  return query;
}

async function checkNotCopyingQuery(item: {
  bigquery: any;
  query: entities.QueryEntity;
}) {
  let bigquery = item.bigquery;
  let query = item.query;

  let bigqueryQueryJob = bigquery.job(query.bigquery_query_job_id);

  let itemQueryJob = await bigqueryQueryJob
    .get()
    .catch((e: any) =>
      helper.reThrow(e, enums.bigqueryErrorsEnum.BIGQUERY_JOB_GET)
    );

  let queryJob = itemQueryJob[0];
  let queryJobGetResponse = itemQueryJob[1];

  if (queryJobGetResponse.status.state === 'DONE') {
    if (queryJobGetResponse.status.errorResult) {
      // QUERY FAIL

      let newLastErrorTs = helper.makeTs();

      let errorResult = queryJobGetResponse.status.errorResult;

      query.status = api.QueryStatusEnum.Error;
      query.refresh = null;
      query.last_error_message =
        `Query fail. ` +
        `Message: '${errorResult.message}'. ` +
        `Reason: '${errorResult.reason}'. ` +
        `Location: '${errorResult.location}'.`;
      query.last_error_ts = newLastErrorTs;
    } else {
      // QUERY SUCCESS

      let data: string;

      if (query.is_pdt === enums.bEnum.TRUE) {
        // bigquery_is_copying false

        let copyJobId = await copyQueryResultsToPdt({
          query: query,
          bigquery: bigquery
        }).catch((e: any) =>
          helper.reThrow(e, enums.procErrorsEnum.PROC_COPY_QUERY_RESULTS_TO_PDT)
        );

        query.bigquery_is_copying = enums.bEnum.TRUE;
        query.bigquery_copy_job_id = copyJobId;
        // don't change query.server_ts and don't notify client
      } else {
        let queryResultsItem = await queryJob
          .getQueryResults()
          .catch((e: any) =>
            helper.reThrow(
              e,
              enums.bigqueryErrorsEnum.BIGQUERY_JOB_GET_QUERY_RESULTS
            )
          );

        let rows = queryResultsItem[0];

        data = JSON.stringify(rows);

        let newLastCompleteTs = helper.makeTs();

        query.status = api.QueryStatusEnum.Completed;
        query.refresh = null;
        query.data = data;
        query.last_complete_ts = newLastCompleteTs;
      }
    }
  }

  return query;
}

async function copyQueryResultsToPdt(item: {
  bigquery: any;
  query: entities.QueryEntity;
}) {
  let bigquery = item.bigquery;
  let query = item.query;

  let pdtTable = bigquery
    .dataset(`mprove_${query.project_id}`)
    .table(query.pdt_id);

  // delete old pdt

  let itemPdtTableExists = await pdtTable
    .exists()
    .catch((e: any) =>
      helper.reThrow(e, enums.bigqueryErrorsEnum.BIGQUERY_TABLE_EXISTS_CHECK)
    );

  let pdtTableExists: boolean = itemPdtTableExists[0];

  if (pdtTableExists === true) {
    let itemPdtTableDelete = await pdtTable
      .delete()
      .catch((e: any) =>
        helper.reThrow(e, enums.bigqueryErrorsEnum.BIGQUERY_TABLE_DELETE)
      );
  }

  // create copy job

  let bigqueryTable = bigquery
    .dataset(`mprove_${query.project_id}`)
    .table(`${query.pdt_id}_${query.query_id}`);

  let itemTableCreateCopyJob = <any>await bigqueryTable
    .createCopyJob(pdtTable, {
      createDisposition: 'CREATE_IF_NEEDED',
      writeDisposition: 'WRITE_EMPTY'
    })
    .catch((e: any) =>
      helper.reThrow(e, enums.bigqueryErrorsEnum.BIGQUERY_CREATE_COPY_JOB)
    );

  let copyJob = itemTableCreateCopyJob[0];
  let copyJobResponse = itemTableCreateCopyJob[1];

  return copyJob.id;
}
