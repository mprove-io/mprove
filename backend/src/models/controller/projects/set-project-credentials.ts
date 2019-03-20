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
import { handler } from '../../../barrels/handler';

export async function setProjectCredentials(req: Request, res: Response) {
  let initId = validator.getRequestInfoInitId(req);

  let userId: string = req.user.email;

  let payload: api.SetProjectCredentialsRequestBody['payload'] = validator.getPayload(
    req
  );

  let projectId = payload.project_id;
  let credentials = payload.credentials;
  let serverTs = payload.server_ts;

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

  let credentialsParsed;

  try {
    credentialsParsed = JSON.parse(credentials);
  } catch (e) {
    helper.reThrow(
      e,
      enums.otherErrorsEnum.SET_PROJECT_CREDENTIALS_ERROR_JSON_NOT_VALID
    );
  }

  let id = helper.makeId();
  let tempId = `${config.DISK_BACKEND_BIGQUERY_CREDENTIALS_PATH}/${id}.json`;

  await disk
    .writeToFile({
      file_absolute_id: tempId,
      content: credentials
    })
    .catch(e => helper.reThrow(e, enums.diskErrorsEnum.DISK_WRITE_TO_FILE));

  await proc
    .createDataset({
      bigquery_project: credentialsParsed.project_id,
      project_id: projectId,
      credentials_file_path: tempId
    })
    .catch(async e => {
      try {
        await disk
          .removePath(tempId)
          .catch(err =>
            helper.reThrow(err, enums.diskErrorsEnum.DISK_REMOVE_PATH)
          );
      } catch (err) {
        handler.errorToLog(err);
      }

      handler.errorToLog(e);

      throw new ServerError({ name: enums.procErrorsEnum.PROC_CREATE_DATASET });
    });

  await disk
    .removePath(tempId)
    .catch(e => helper.reThrow(e, enums.diskErrorsEnum.DISK_REMOVE_PATH));

  let fileId = `${config.DISK_BACKEND_BIGQUERY_CREDENTIALS_PATH}/${projectId}.json`;

  await disk
    .writeToFile({
      file_absolute_id: fileId,
      content: credentials
    })
    .catch(e => helper.reThrow(e, enums.diskErrorsEnum.DISK_WRITE_TO_FILE));

  project.bigquery_project = credentialsParsed.project_id;
  project.bigquery_client_email = credentialsParsed.client_email;
  project.bigquery_credentials = credentials;
  project.bigquery_credentials_file_path = fileId;
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
        bigquery_project: project.bigquery_project,
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

  let responsePayload: api.SetProjectCredentialsResponse200Body['payload'] = {
    project: wrapper.wrapToApiProject(project),
    dev_and_prod_structs_or_empty: [
      wrapper.wrapStructResponse(devStruct),
      wrapper.wrapStructResponse(prodStruct)
    ]
  };

  sender.sendClientResponse(req, res, responsePayload);
}
