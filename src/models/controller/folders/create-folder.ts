import { Request, Response } from 'express';
import { getConnection } from 'typeorm';
import { api } from '../../../barrels/api';
import { config } from '../../../barrels/config';
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

export async function createFolder(req: Request, res: Response) {

  let initId = validator.getRequestInfoInitId(req);

  let payload: api.CreateFolderRequestBodyPayload = validator.getPayload(req);

  let projectId = payload.project_id;
  let repoId = payload.repo_id;
  let parentNodeId = payload.node_id;
  let folderName = payload.name;

  let storeRepos = store.getReposRepo();

  let repo = <entities.RepoEntity>await storeRepos.findOne({
    project_id: projectId,
    repo_id: repoId
  })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_REPOS_FIND_ONE));

  if (!repo) { throw new ServerError({ name: enums.otherErrorsEnum.REPO_NOT_FOUND }); }

  let repoDir = `${config.DISK_BASE_PATH}/${projectId}/${repoId}`;

  let parent = parentNodeId.substring(projectId.length + 1);

  parent = parent.length > 0 ? parent + '/' : parent;

  let folderAbsolutePath = repoDir + '/' + parent + folderName;

  let gitKeepFileAbsoluteId = folderAbsolutePath + '/' + '.gitkeep';

  await disk.ensureFile(gitKeepFileAbsoluteId)
    .catch(e => helper.reThrow(e, enums.diskErrorsEnum.DISK_ENSURE_FILE));

  await git.addChangesToStage({
    project_id: projectId,
    repo_id: repoId,
  })
    .catch(e => helper.reThrow(e, enums.gitErrorsEnum.GIT_ADD_CHANGES_TO_STAGE));

  let itemStatus = <interfaces.ItemStatus>await git.getRepoStatus({
    project_id: projectId,
    repo_id: repoId
  })
    .catch(e => helper.reThrow(e, enums.gitErrorsEnum.GIT_GET_REPO_STATUS));

  let itemCatalog = <interfaces.ItemCatalog>await disk.getRepoCatalogNodesAndFiles({
    project_id: projectId,
    repo_id: repoId,
  })
    .catch(e => helper.reThrow(e, enums.diskErrorsEnum.DISK_GET_REPO_CATALOG_NODES_AND_FILES));

  repo.status = itemStatus.status;
  repo.conflicts = JSON.stringify(itemStatus.conflicts);
  repo.nodes = JSON.stringify(itemCatalog.nodes);
  // repo.struct_id not changed
  // repo.pdts_sorted not changed
  // repo.udfs_content not changed

  // update server_ts
  let newServerTs = helper.makeTs();

  repo.server_ts = newServerTs;

  // save to database
  let connection = getConnection();

  await connection.transaction(async manager => {

    await store.save({
      manager: manager,
      records: {
        repos: [repo],
      },
      server_ts: newServerTs,
      source_init_id: initId,
    })
      .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_SAVE));
  })
    .catch(e => helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_TRANSACTION));

  // response

  let responsePayload: api.CreateFolderResponse200BodyPayload = {
    dev_repo: wrapper.wrapToApiRepo(repo),
  };

  sender.sendClientResponse(req, res, responsePayload);
}
