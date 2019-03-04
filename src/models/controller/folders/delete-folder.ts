import { Request, Response } from 'express';
import { api } from '../../../barrels/api';
import { config } from '../../../barrels/config';
import { disk } from '../../../barrels/disk';
import { entities } from '../../../barrels/entities';
import { enums } from '../../../barrels/enums';
import { git } from '../../../barrels/git';
import { helper } from '../../../barrels/helper';
import { interfaces } from '../../../barrels/interfaces';
import { proc } from '../../../barrels/proc';
import { sender } from '../../../barrels/sender';
import { store } from '../../../barrels/store';
import { validator } from '../../../barrels/validator';
import { wrapper } from '../../../barrels/wrapper';
import { ServerError } from '../../server-error';

export async function deleteFolder(req: Request, res: Response) {

  let initId = validator.getRequestInfoInitId(req);

  let payload: api.DeleteFolderRequestBodyPayload = validator.getPayload(req);

  let projectId = payload.project_id;
  let repoId = payload.repo_id;
  let nodeId = payload.node_id;
  let serverTs = payload.repo_server_ts;

  let storeRepos = store.getReposRepo();

  let repo = <entities.RepoEntity>await storeRepos.findOne({
    project_id: projectId,
    repo_id: repoId
  })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_REPOS_FIND_ONE));

  if (!repo) { throw new ServerError({ name: enums.otherErrorsEnum.REPO_NOT_FOUND }); }

  helper.checkServerTs(repo, serverTs);

  let repoDir = `${config.DISK_BASE_PATH}/${projectId}/${repoId}`;

  let folderAbsolutePath = repoDir + '/' + nodeId.substring(projectId.length + 1);

  await disk.removePath(folderAbsolutePath)
    .catch(e => helper.reThrow(e, enums.diskErrorsEnum.DISK_REMOVE_PATH));

  await git.addChangesToStage({
    project_id: projectId,
    repo_id: repoId,
  })
    .catch(e => helper.reThrow(e, enums.gitErrorsEnum.GIT_ADD_CHANGES_TO_STAGE));


  let itemChanges = <interfaces.ItemProcessDevRepoChanges>await proc.processDevRepoChanges({
    project_id: projectId,
    repo_id: repoId,
    dev_repo: repo,
    init_id: initId
  })
    .catch(e => helper.reThrow(e, enums.procErrorsEnum.PROC_PROCESS_DEV_REPO_CHANGES));

  // response

  let responsePayload: api.DeleteFolderResponse200BodyPayload = {
    deleted_folder_dev_files: itemChanges.deleted_dev_files.map(file => wrapper.wrapToApiFile(file)),
    dev_struct: {
      errors: itemChanges.errors.map(error => wrapper.wrapToApiError(error)),
      models: itemChanges.models.map(model => wrapper.wrapToApiModel(model)),
      dashboards: itemChanges.dashboards.map(dashboard => wrapper.wrapToApiDashboard(dashboard)),
      repo: wrapper.wrapToApiRepo(itemChanges.dev_repo),
    }
  };

  sender.sendClientResponse(req, res, responsePayload);
}
