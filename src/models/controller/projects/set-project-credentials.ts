import { Request, Response } from 'express';
import { forEach } from 'p-iteration';
import { getConnection } from 'typeorm';
import { api } from '../../../barrels/api';
import { blockml } from '../../../barrels/blockml';
import { config } from '../../../barrels/config';
import { constants } from '../../../barrels/constants';
import { disk } from '../../../barrels/disk';
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

export async function setProjectCredentials(req: Request, res: Response) {
  let initId = validator.getRequestInfoInitId(req);

  let userId: string = req.user.email;

  let payload: api.SetProjectCredentialsRequestBodyPayload = validator.getPayload(
    req
  );

  let projectId = payload.project_id;
  let credentials = payload.credentials;
  let serverTs = payload.server_ts;

  let credentialsParsed = JSON.parse(credentials);

  let bigqueryProject = credentialsParsed.project_id;
  let bigqueryClientEmail = credentialsParsed.client_email;

  let storeProjects = store.getProjectsRepo();

  let project = <entities.ProjectEntity>(
    await storeProjects
      .findOne(projectId)
      .catch(e =>
        helper.reThrow(e, enums.storeErrorsEnum.STORE_PROJECTS_FIND_ONE)
      )
  );

  if (!project) {
    throw new ServerError({ name: enums.otherErrorsEnum.PROJECT_NOT_FOUND });
  }

  helper.checkServerTs(project, serverTs);

  let fileAbsoluteId = `${
    config.DISK_BIGQUERY_CREDENTIALS_PATH
  }/${projectId}.json`;

  await disk
    .writeToFile({
      file_absolute_id: fileAbsoluteId,
      content: credentials
    })
    .catch(e => helper.reThrow(e, enums.diskErrorsEnum.DISK_WRITE_TO_FILE));

  await proc
    .createDataset({
      project_id: projectId,
      credentials_file_path: fileAbsoluteId
    })
    .catch(e => helper.reThrow(e, enums.procErrorsEnum.PROC_CREATE_DATASET));

  project.bigquery_project = bigqueryProject;
  project.bigquery_client_email = bigqueryClientEmail;
  project.bigquery_credentials = credentials;
  project.bigquery_credentials_file_path = fileAbsoluteId;
  project.has_credentials = enums.bEnum.TRUE;

  let storeRepos = store.getReposRepo();

  let projectRepos = <entities.RepoEntity[]>await storeRepos
    .find({
      project_id: projectId
    })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_REPOS_FIND));

  let repos: entities.RepoEntity[] = [];

  let dashboards: entities.DashboardEntity[] = [];
  let errors: entities.ErrorEntity[] = [];
  let mconfigs: entities.MconfigEntity[] = [];
  let models: entities.ModelEntity[] = [];
  let queries: entities.QueryEntity[] = [];

  let prodStruct: interfaces.ItemStructAndRepo;
  let devStruct: interfaces.ItemStructAndRepo;

  await forEach(projectRepos, async repo => {
    let structId = helper.makeId();

    let itemCatalog = <interfaces.ItemCatalog>await disk
      .getRepoCatalogNodesAndFiles({
        project_id: projectId,
        repo_id: repo.repo_id
      })
      .catch(e =>
        helper.reThrow(
          e,
          enums.diskErrorsEnum.DISK_GET_REPO_CATALOG_NODES_AND_FILES
        )
      );

    let itemRebuildStruct = <interfaces.ItemStruct>await blockml
      .rebuildStruct({
        files: itemCatalog.files,
        project_id: projectId,
        repo_id: repo.repo_id,
        bq_project: project.bigquery_project,
        week_start: <any>project.week_start,
        struct_id: structId
      })
      .catch(e =>
        helper.reThrow(e, enums.blockmlErrorsEnum.BLOCKML_REBUILD_STRUCT)
      );

    let {
      pdts_sorted: pdtsSorted,
      udfs_content: udfsContent,
      dashboards: repoDashboards,
      errors: repoErrors,
      mconfigs: repoMconfigs,
      models: repoModels,
      queries: repoQueries
    } = itemRebuildStruct;

    repo.pdts_sorted = pdtsSorted;
    repo.udfs_content = udfsContent;
    repo.struct_id = structId;

    repos.push(repo);

    queries = helper.makeNewArray(queries, repoQueries);
    models = helper.makeNewArray(models, repoModels);
    mconfigs = helper.makeNewArray(mconfigs, repoMconfigs);
    dashboards = helper.makeNewArray(dashboards, repoDashboards);
    errors = helper.makeNewArray(errors, repoErrors);

    if (repo.repo_id === constants.PROD_REPO_ID) {
      prodStruct = {
        errors: repoErrors,
        models: repoModels,
        dashboards: repoDashboards,
        repo: repo
      };
    } else if (repo.repo_id === userId) {
      devStruct = {
        errors: repoErrors,
        models: repoModels,
        dashboards: repoDashboards,
        repo: repo
      };
    }
  }).catch(e => helper.reThrow(e, enums.otherErrorsEnum.FOR_EACH));

  // update server_ts

  let newServerTs = helper.makeTs();

  project.server_ts = newServerTs;

  repos = helper.refreshServerTs(repos, newServerTs);
  queries = helper.refreshServerTs(queries, newServerTs);
  models = helper.refreshServerTs(models, newServerTs);
  mconfigs = helper.refreshServerTs(mconfigs, newServerTs);
  dashboards = helper.refreshServerTs(dashboards, newServerTs);
  errors = helper.refreshServerTs(errors, newServerTs);

  devStruct = helper.refreshStructServerTs(devStruct, newServerTs);
  prodStruct = helper.refreshStructServerTs(prodStruct, newServerTs);

  // save to database

  let connection = getConnection();

  await connection
    .transaction(async manager => {
      await store
        .save({
          manager: manager,
          records: {
            projects: [project],
            repos: repos,
            queries: queries,
            models: models,
            mconfigs: mconfigs,
            dashboards: dashboards,
            errors: errors
          },
          server_ts: newServerTs,
          source_init_id: initId
        })
        .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_SAVE));
    })
    .catch(e => helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_TRANSACTION));

  // response

  let responsePayload: api.SetProjectCredentialsResponse200BodyPayload = {
    project: wrapper.wrapToApiProject(project),
    dev_and_prod_structs_or_empty: [
      wrapper.wrapStructResponse(devStruct),
      wrapper.wrapStructResponse(prodStruct)
    ]
  };

  sender.sendClientResponse(req, res, responsePayload);
}
