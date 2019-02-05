import { Request, Response } from 'express';
import { getConnection } from 'typeorm';
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

export async function createDashboard(req: Request, res: Response) {
  let initId = validator.getRequestInfoInitId(req);

  let payload: api.CreateDashboardRequestBody['payload'] = validator.getPayload(
    req
  );

  let projectId = payload.project_id;
  let repoId = payload.repo_id;
  let oldDashboardId = payload.old_dashboard_id;
  let newDashboardId = payload.new_dashboard_id;
  let newDashboardFields = payload.new_dashboard_fields;

  let storeProjects = store.getProjectsRepo();
  let storeRepos = store.getReposRepo();
  let storeDashboards = store.getDashboardsRepo();
  let storeModels = store.getModelsRepo();

  let [project, repo, oldDashboard, models] = <
    [
      entities.ProjectEntity,
      entities.RepoEntity,
      entities.DashboardEntity,
      entities.ModelEntity[]
    ]
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

    storeDashboards
      .findOne({
        project_id: projectId,
        repo_id: repoId,
        dashboard_id: oldDashboardId
      })
      .catch(e =>
        helper.reThrow(e, enums.storeErrorsEnum.STORE_DASHBOARDS_FIND_ONE)
      ),

    storeModels
      .find({
        project_id: projectId,
        repo_id: repoId
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
  if (!oldDashboard) {
    throw new ServerError({ name: enums.otherErrorsEnum.DASHBOARD_NOT_FOUND });
  }

  let cuts = models.map(model => ({
    model_id: model.model_id,
    model_content: model.content
  }));

  let itemProcessDashboard = <interfaces.ItemProcessDashboard>await blockml
    .processDashboard({
      project_id: projectId,
      repo_id: repoId,
      bq_project: project.bigquery_project,
      week_start: <any>project.week_start,
      old_dashboard_content: oldDashboard.content,
      udfs_content: repo.udfs_content,
      new_dashboard_id: newDashboardId,
      new_dashboard_fields: newDashboardFields,
      cuts: cuts,
      struct_id: repo.struct_id
    })
    .catch(e =>
      helper.reThrow(e, enums.blockmlErrorsEnum.BLOCKML_PROCESS_DASHBOARD)
    );

  // update server_ts
  let newServerTs = helper.makeTs();

  itemProcessDashboard.mconfigs = helper.refreshServerTs(
    itemProcessDashboard.mconfigs,
    newServerTs
  );
  itemProcessDashboard.queries = helper.refreshServerTs(
    itemProcessDashboard.queries,
    newServerTs
  );
  itemProcessDashboard.dashboard.server_ts = newServerTs;

  // save to database
  let connection = getConnection();

  await connection
    .transaction(async manager => {
      await store
        .save({
          manager: manager,
          records: {
            mconfigs: itemProcessDashboard.mconfigs,
            queries: itemProcessDashboard.queries,
            dashboards: [itemProcessDashboard.dashboard]
          },
          server_ts: newServerTs,
          source_init_id: initId
        })
        .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_SAVE));
    })
    .catch(e => helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_TRANSACTION));

  // response

  let responsePayload: api.CreateDashboardResponse200Body['payload'] = {
    dashboard: wrapper.wrapToApiDashboard(itemProcessDashboard.dashboard),
    dashboard_mconfigs: itemProcessDashboard.mconfigs.map(mconfig =>
      wrapper.wrapToApiMconfig(mconfig)
    ),
    dashboard_queries: itemProcessDashboard.queries.map(query =>
      wrapper.wrapToApiQuery(query)
    )
  };

  sender.sendClientResponse(req, res, responsePayload);
}
