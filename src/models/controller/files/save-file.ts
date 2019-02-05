import { Request, Response } from 'express';
import { getConnection } from 'typeorm';
import { api } from '../../../barrels/api';
import { blockml } from '../../../barrels/blockml';
import { disk } from '../../../barrels/disk';
import { entities } from '../../../barrels/entities';
import { enums } from '../../../barrels/enums';
import { git } from '../../../barrels/git';
import { helper } from '../../../barrels/helper';
import { interfaces } from '../../../barrels/interfaces';
import { sender } from '../../../barrels/sender';
import { store } from '../../../barrels/store';
import { validator } from '../../../barrels/validator';
import { wrapper } from '../../../barrels/wrapper';
import { ServerError } from '../../server-error';

export async function saveFile(req: Request, res: Response) {
  let initId = validator.getRequestInfoInitId(req);

  let payload: api.SaveFileRequestBody['payload'] = validator.getPayload(req);

  let projectId = payload.project_id;
  let repoId = payload.repo_id;
  let fileId = payload.file_id;
  let content = payload.content;
  let serverTs = payload.server_ts;

  let storeFiles = store.getFilesRepo();
  let storeRepos = store.getReposRepo();
  let storeProjects = store.getProjectsRepo();

  let [file, repo, project] = <
    [entities.FileEntity, entities.RepoEntity, entities.ProjectEntity]
  >await Promise.all([
    storeFiles
      .findOne({
        project_id: projectId,
        repo_id: repoId,
        file_id: fileId
      })
      .catch(e =>
        helper.reThrow(e, enums.storeErrorsEnum.STORE_FILES_FIND_ONE)
      ),

    storeRepos
      .findOne({
        project_id: projectId,
        repo_id: repoId
      })
      .catch(e =>
        helper.reThrow(e, enums.storeErrorsEnum.STORE_REPOS_FIND_ONE)
      ),

    storeProjects
      .findOne(projectId)
      .catch(e =>
        helper.reThrow(e, enums.storeErrorsEnum.STORE_PROJECTS_FIND_ONE)
      )
  ]).catch(e => helper.reThrow(e, enums.otherErrorsEnum.PROMISE_ALL));

  if (!file) {
    throw new ServerError({ name: enums.otherErrorsEnum.FILE_NOT_FOUND });
  }
  if (!repo) {
    throw new ServerError({ name: enums.otherErrorsEnum.REPO_NOT_FOUND });
  }
  if (!project) {
    throw new ServerError({ name: enums.otherErrorsEnum.PROJECT_NOT_FOUND });
  }

  helper.checkServerTs(file, serverTs);

  let oldStructId = repo.struct_id;
  let newStructId = helper.makeId();

  await disk
    .writeToFile({
      file_absolute_id: file.file_absolute_id,
      content: content
    })
    .catch(e => helper.reThrow(e, enums.diskErrorsEnum.DISK_WRITE_TO_FILE));

  file.content = content;

  await git
    .addChangesToStage({
      project_id: projectId,
      repo_id: repoId
    })
    .catch(e =>
      helper.reThrow(e, enums.gitErrorsEnum.GIT_ADD_CHANGES_TO_STAGE)
    );

  let itemStatus = <interfaces.ItemStatus>await git
    .getRepoStatus({
      project_id: projectId,
      repo_id: repoId
    })
    .catch(e => helper.reThrow(e, enums.gitErrorsEnum.GIT_GET_REPO_STATUS));

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

  let itemStruct = <interfaces.ItemStruct>await blockml
    .rebuildStruct({
      files: itemCatalog.files,
      project_id: projectId,
      repo_id: repo.repo_id,
      bq_project: project.bigquery_project,
      week_start: <any>project.week_start,
      struct_id: newStructId
    })
    .catch(e =>
      helper.reThrow(e, enums.blockmlErrorsEnum.BLOCKML_REBUILD_STRUCT)
    );

  repo.status = itemStatus.status;
  repo.conflicts = JSON.stringify(itemStatus.conflicts);
  // repo.nodes not changed
  repo.struct_id = newStructId;
  repo.pdts_sorted = itemStruct.pdts_sorted;
  repo.udfs_content = itemStruct.udfs_content;

  // update server_ts

  let newServerTs = helper.makeTs();

  repo.server_ts = newServerTs;
  file.server_ts = newServerTs;

  itemStruct.models = helper.refreshServerTs(itemStruct.models, newServerTs);
  itemStruct.dashboards = helper.refreshServerTs(
    itemStruct.dashboards,
    newServerTs
  );
  itemStruct.mconfigs = helper.refreshServerTs(
    itemStruct.mconfigs,
    newServerTs
  );
  itemStruct.errors = helper.refreshServerTs(itemStruct.errors, newServerTs);
  itemStruct.queries = helper.refreshServerTs(itemStruct.queries, newServerTs);

  // save to database
  let connection = getConnection();

  await connection
    .transaction(async manager => {
      await store
        .save({
          manager: manager,
          records: {
            repos: [repo],
            files: [file],
            queries: itemStruct.queries,
            models: itemStruct.models,
            mconfigs: itemStruct.mconfigs,
            dashboards: itemStruct.dashboards,
            errors: itemStruct.errors
          },
          server_ts: newServerTs,
          source_init_id: initId
        })
        .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_SAVE));
    })
    .catch(e => helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_TRANSACTION));

  await store
    .deleteOldStruct({
      repo_id: repoId,
      old_struct_id: oldStructId
    })
    .catch(e =>
      helper.reThrow(e, enums.storeErrorsEnum.STORE_DELETE_OLD_STRUCT)
    );

  // response

  let responsePayload: api.SaveFileResponse200Body['payload'] = {
    saved_dev_file: wrapper.wrapToApiFile(file),
    dev_struct: {
      errors: itemStruct.errors.map(error => wrapper.wrapToApiError(error)),
      models: itemStruct.models.map(model => wrapper.wrapToApiModel(model)),
      dashboards: itemStruct.dashboards.map(dashboard =>
        wrapper.wrapToApiDashboard(dashboard)
      ),
      repo: wrapper.wrapToApiRepo(repo)
    }
  };

  sender.sendClientResponse(req, res, responsePayload);
}
