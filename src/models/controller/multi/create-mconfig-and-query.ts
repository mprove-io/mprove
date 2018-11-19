import { Request, Response } from 'express';
import { getConnection, In } from 'typeorm';
import { api } from '../../../barrels/api';
import { blockml } from '../../../barrels/blockml';
import { entities } from '../../../barrels/entities';
import { enums } from '../../../barrels/enums';
import { helper } from '../../../barrels/helper';
import { interfaces } from '../../../barrels/interfaces';
import { sender } from '../../../barrels/sender';
import { store } from '../../../barrels/store';
import { validator } from '../../../barrels/validator';
import { wrapper } from '../../../barrels/wrapper';
import { ServerError } from '../../server-error';

export async function createMconfigAndQuery(req: Request, res: Response) {
  let initId = validator.getRequestInfoInitId(req);

  let payload: api.CreateMconfigAndQueryRequestBodyPayload = validator.getPayload(
    req
  );

  let mconfig = payload.mconfig;
  let query = payload.query;

  let projectId = mconfig.project_id;
  let repoId = mconfig.repo_id;
  let modelId = mconfig.model_id;

  let storeProjects = store.getProjectsRepo();
  let storeRepos = store.getReposRepo();
  let storeModels = store.getModelsRepo();

  let [project, repo, model] = <
    [entities.ProjectEntity, entities.RepoEntity, entities.ModelEntity]
  >await Promise.all([
    storeProjects
      .findOne(projectId)
      .catch(e =>
        helper.reThrow(e, enums.storeErrorsEnum.STORE_PROJECTS_FIND_ONE)
      ),

    storeRepos
      .findOne({
        project_id: projectId,
        repo_id: repoId
      })
      .catch(e =>
        helper.reThrow(e, enums.storeErrorsEnum.STORE_REPOS_FIND_ONE)
      ),

    storeModels
      .findOne({
        project_id: projectId,
        repo_id: repoId,
        model_id: modelId
      })
      .catch(e =>
        helper.reThrow(e, enums.storeErrorsEnum.STORE_MODELS_FIND_ONE)
      )
  ]).catch(e => helper.reThrow(e, enums.otherErrorsEnum.PROMISE_ALL));

  if (!project) {
    throw new ServerError({ name: enums.otherErrorsEnum.PROJECT_NOT_FOUND });
  }
  if (!repo) {
    throw new ServerError({ name: enums.otherErrorsEnum.REPO_NOT_FOUND });
  }
  if (!model) {
    throw new ServerError({ name: enums.otherErrorsEnum.MODEL_NOT_FOUND });
  }

  let itemProcessQuery = <interfaces.ItemProcessQuery>await blockml
    .processQuery({
      project_id: mconfig.project_id,
      bq_project: project.bigquery_project,
      week_start: <any>project.week_start,
      mconfig: mconfig,
      model_content: model.content,
      udfs_content: repo.udfs_content,
      struct_id: repo.struct_id
    })
    .catch(e =>
      helper.reThrow(e, enums.blockmlErrorsEnum.BLOCKML_PROCESS_QUERY)
    );

  // dep queries
  let queries: entities.QueryEntity[] = [itemProcessQuery.query];

  let pdtDepsAll: string[] = JSON.parse(itemProcessQuery.query.pdt_deps_all);

  if (pdtDepsAll.length > 0) {
    let storeQueries = store.getQueriesRepo();

    let depQueries = <entities.QueryEntity[]>await storeQueries
      .find({
        pdt_id: In(pdtDepsAll)
      })
      .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_QUERIES_FIND));

    if (depQueries && depQueries.length > 0) {
      queries = helper.makeNewArray(queries, depQueries);
    }
  }

  // update server_ts
  let newServerTs = helper.makeTs();

  itemProcessQuery.mconfig.server_ts = newServerTs;
  itemProcessQuery.query.server_ts = newServerTs;

  // save to database
  let connection = getConnection();

  await connection
    .transaction(async manager => {
      await store
        .save({
          manager: manager,
          records: {
            mconfigs: [itemProcessQuery.mconfig],
            queries: [itemProcessQuery.query]
          },
          server_ts: newServerTs,
          source_init_id: initId
        })
        .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_SAVE));
    })
    .catch(e => helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_TRANSACTION));

  // response

  let responsePayload: api.CreateMconfigAndQueryResponse200BodyPayload = {
    mconfig: wrapper.wrapToApiMconfig(itemProcessQuery.mconfig),
    queries: queries.map(x => wrapper.wrapToApiQuery(x))
  };

  sender.sendClientResponse(req, res, responsePayload);
}
