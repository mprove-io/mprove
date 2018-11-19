import { Request, Response } from 'express';
import { getConnection, In } from 'typeorm';
import { api } from '../../../barrels/api';
import { entities } from '../../../barrels/entities';
import { enums } from '../../../barrels/enums';
import { helper } from '../../../barrels/helper';
import { proc } from '../../../barrels/proc';
import { sender } from '../../../barrels/sender';
import { store } from '../../../barrels/store';
import { validator } from '../../../barrels/validator';
import { wrapper } from '../../../barrels/wrapper';
import { ServerError } from '../../server-error';

export async function runQueries(req: Request, res: Response) {
  let initId = validator.getRequestInfoInitId(req);

  let userId: string = req.user.email;

  let payload: api.RunQueriesRequestBodyPayload = validator.getPayload(req);

  let queryIds = payload.query_ids;
  let refresh = payload.refresh;

  let storeQueries = store.getQueriesRepo();

  let queries = <entities.QueryEntity[]>await storeQueries
    .find({
      query_id: In(queryIds)
    })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_QUERIES_FIND));

  let projectId = queries[0].project_id;

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

  let newLastRunTs = helper.makeTs();

  let queryPacks: entities.QueryEntity[][] = <entities.QueryEntity[][]>(
    await Promise.all(
      queries.map(
        async query => <Promise<entities.QueryEntity[]>>proc
            .runQuery({
              is_top: true,
              query: query,
              new_last_run_ts: newLastRunTs,
              credentials_file_path: project.bigquery_credentials_file_path,
              user_id: userId,
              refresh: refresh
            })
            .catch(e => helper.reThrow(e, enums.procErrorsEnum.PROC_RUN_QUERY))
      )
    ).catch(e => helper.reThrow(e, enums.otherErrorsEnum.PROMISE_ALL))
  );

  let processedQueries: entities.QueryEntity[] = [];

  queryPacks.forEach(pack => {
    processedQueries = helper.makeNewArray(processedQueries, pack);
  });

  // update server_ts
  let newServerTs = helper.makeTs();

  processedQueries = helper.refreshServerTs(processedQueries, newServerTs);

  // save to database
  let connection = getConnection();

  if (processedQueries.length > 0) {
    await connection
      .transaction(async manager => {
        await store
          .save({
            manager: manager,
            records: {
              queries: processedQueries
            },
            server_ts: newServerTs,
            source_init_id: initId
          })
          .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_SAVE));
      })
      .catch(e =>
        helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_TRANSACTION)
      );
  }

  // response

  let responseQueries = processedQueries; // .filter(q => queryIds.indexOf(q.query_id) > -1);

  let responsePayload: api.RunQueriesResponse200BodyPayload = {
    running_queries: responseQueries.map(query => wrapper.wrapToApiQuery(query))
  };

  sender.sendClientResponse(req, res, responsePayload);
}
