import { Request, Response } from 'express';
import { getConnection, In } from 'typeorm';
import { api } from '../../../barrels/api';
import { entities } from '../../../barrels/entities';
import { enums } from '../../../barrels/enums';
import { helper } from '../../../barrels/helper';
import { interfaces } from '../../../barrels/interfaces';
import { proc } from '../../../barrels/proc';
import { sender } from '../../../barrels/sender';
import { store } from '../../../barrels/store';
import { validator } from '../../../barrels/validator';
import { wrapper } from '../../../barrels/wrapper';
import { ServerError } from '../../server-error';

export async function runQueriesDry(req: Request, res: Response) {
  let initId = validator.getRequestInfoInitId(req);

  let payload: api.RunQueriesDryRequestBodyPayload = validator.getPayload(req);

  let queryIds = payload.query_ids;
  let dryId = payload.dry_id;

  let storeQueries = store.getQueriesRepo();

  let queries = <entities.QueryEntity[]>await storeQueries
    .find({
      query_id: In(queryIds)
    })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_QUERIES_FIND));

  let projectId = queries[0].project_id; // TODO: pass project_id through api

  let storeProjects = store.getProjectsRepo();

  let project = <entities.ProjectEntity>await storeProjects
    .findOne({
      project_id: projectId
    })
    .catch(e =>
      helper.reThrow(e, enums.storeErrorsEnum.STORE_PROJECTS_FIND_ONE)
    );

  if (!project) {
    throw new ServerError({ name: enums.otherErrorsEnum.PROJECT_NOT_FOUND });
  }

  // TODO: check has credentials

  let newLastRunDryTs = Date.now(); // number (not to save in db)

  // TODO: rewrite credentials from db to file

  let results = <interfaces.ItemRunQueryDry[]>await Promise.all(
    queries.map(
      async query => <Promise<interfaces.ItemRunQueryDry>>proc
          .runQueryDry({
            query: query,
            new_last_run_dry_ts: newLastRunDryTs,
            credentials_file_path: project.bigquery_credentials_file_path
          })
          .catch(e =>
            helper.reThrow(e, enums.procErrorsEnum.PROC_RUN_QUERY_DRY)
          )
    )
  ).catch(e =>
    helper.reThrow(e, enums.storeErrorsEnum.STORE_PROJECTS_FIND_ONE)
  );

  let validEstimates = results
    .filter(result => !!result.valid_estimate)
    .map(x => x.valid_estimate);

  let errorQueries = results
    .filter(result => !!result.error_query)
    .map(x => x.error_query);

  // update server_ts
  let newServerTs = helper.makeTs();

  errorQueries = helper.refreshServerTs(errorQueries, newServerTs);

  // save to database
  let connection = getConnection();

  await connection
    .transaction(async manager => {
      await store
        .save({
          manager: manager,
          records: {
            queries: errorQueries
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

  // response

  let responsePayload: api.RunQueriesDryResponse200BodyPayload = {
    dry_id: dryId,
    valid_estimates: validEstimates,
    error_queries: errorQueries.map(query => wrapper.wrapToApiQuery(query))
  };

  sender.sendClientResponse(req, res, responsePayload);
}
