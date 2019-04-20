import { Request, Response } from 'express';
import { getConnection, In, Not } from 'typeorm';
import { api } from '../../../barrels/api';
import { entities } from '../../../barrels/entities';
import { enums } from '../../../barrels/enums';
import { helper } from '../../../barrels/helper';
import { sender } from '../../../barrels/sender';
import { store } from '../../../barrels/store';
import { validator } from '../../../barrels/validator';
import { wrapper } from '../../../barrels/wrapper';
import { config } from '../../../barrels/config';
import { forEach } from 'p-iteration';
const { BigQuery } = require('@google-cloud/bigquery');

export async function cancelQueries(req: Request, res: Response) {
  let initId = validator.getRequestInfoInitId(req);

  let payload: api.CancelQueriesRequestBody['payload'] = validator.getPayload(
    req
  );

  let queryIds = payload.query_ids;

  let storeQueries = store.getQueriesRepo();

  let queries = <entities.QueryEntity[]>await storeQueries
    .find({
      query_id: In(queryIds),
      status: In([api.QueryStatusEnum.Running, api.QueryStatusEnum.Waiting])
    })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_QUERIES_FIND));

  if (queries.length > 0) {
    let projectId = queries[0].project_id;

    let storeProjects = store.getProjectsRepo();

    let project = <entities.ProjectEntity>await storeProjects
      .findOne({
        project_id: projectId
      })
      .catch(e =>
        helper.reThrow(e, enums.storeErrorsEnum.STORE_PROJECTS_FIND_ONE)
      );

    let credentialsFilePath = `${
      config.DISK_BACKEND_BIGQUERY_CREDENTIALS_PATH
    }/${projectId}.json`;

    let bigquery = new BigQuery({
      projectId: project.bigquery_project,
      keyFilename: credentialsFilePath
    });

    let newLastCancelTs = helper.makeTs();

    await forEach(queries, async query => {
      if (query.status === api.QueryStatusEnum.Running) {
        let bigqueryQueryJob = bigquery.job(query.bigquery_query_job_id);
        await bigqueryQueryJob.cancel();
      }

      query.status = api.QueryStatusEnum.Canceled;
      query.last_cancel_ts = newLastCancelTs;
    });

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
            source_init_id: initId
          })
          .catch(e =>
            helper.reThrow(e, enums.storeErrorsEnum.STORE_PROJECTS_FIND_ONE)
          );
      })
      .catch(e =>
        helper.reThrow(e, enums.storeErrorsEnum.STORE_PROJECTS_FIND_ONE)
      );
  }

  // response

  let responsePayload: api.CancelQueriesResponse200Body['payload'] = {
    canceled_queries: queries.map(query => wrapper.wrapToApiQuery(query))
  };

  sender.sendClientResponse(req, res, responsePayload);
}
