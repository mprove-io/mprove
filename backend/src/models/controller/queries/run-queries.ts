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
import { forEach } from 'p-iteration';
import { QueryEntity } from '../../store/entities/_index';

export async function runQueries(req: Request, res: Response) {
  let initId = validator.getRequestInfoInitId(req);

  let userId: string = req.user.email;

  let payload: api.RunQueriesRequestBody['payload'] = validator.getPayload(req);

  let queryIds = payload.query_ids;
  let refresh = payload.refresh;

  let storeQueries = store.getQueriesRepo();

  let queries = <entities.QueryEntity[]>await storeQueries
    .find({
      query_id: In(queryIds)
    })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_QUERIES_FIND));

  let depsAllQueryIdsMap: { [name: string]: number } = {};

  queries.forEach(q => {
    JSON.parse(q.pdt_deps_all).forEach((x: string) => {
      depsAllQueryIdsMap[x] = 1;
    });
  });

  let depsAllQueryIds = Object.keys(depsAllQueryIdsMap);

  let allDepQueries: QueryEntity[] = [];

  if (depsAllQueryIds.length > 0) {
    allDepQueries = <entities.QueryEntity[]>await storeQueries
      .find({
        pdt_id: In(depsAllQueryIds)
      })
      .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_QUERIES_FIND));
  }

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

  let processedQueries: entities.QueryEntity[] = [];

  let checkedQueryIds: string[] = [];

  await forEach(queries, async query => {
    let depQueries = await (<Promise<entities.QueryEntity[]>>proc
      .runQuery({
        all_dep_queries: allDepQueries,
        checked_query_ids: checkedQueryIds,
        is_top: true,
        query: query,
        new_last_run_ts: newLastRunTs,
        bigquery_project: project.bigquery_project,
        credentials_file_path: project.bigquery_credentials_file_path,
        user_id: userId,
        refresh: refresh
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
              source_init_id: initId
            })
            .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_SAVE));
        })
        .catch(e =>
          helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_TRANSACTION)
        );
    }

    processedQueries = helper.makeNewArray(processedQueries, depQueries);
  });

  // response

  let responseQueries = processedQueries; // .filter(q => queryIds.indexOf(q.query_id) > -1);

  let responsePayload: api.RunQueriesResponse200Body['payload'] = {
    running_queries: responseQueries.map(query => wrapper.wrapToApiQuery(query))
  };

  sender.sendClientResponse(req, res, responsePayload);
}
