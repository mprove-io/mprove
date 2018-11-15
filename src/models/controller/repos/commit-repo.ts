import { Request, Response } from 'express';
import { getConnection } from 'typeorm';
import { api } from '../../../barrels/api';
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

export async function commitRepo(req: Request, res: Response) {
  let initId = validator.getRequestInfoInitId(req);

  let userId: string = req.user.email;

  let payload: api.CommitRepoRequestBodyPayload = validator.getPayload(req);

  let projectId = payload.project_id;
  let repoId = payload.repo_id;
  let serverTs = payload.server_ts;

  let storeRepos = store.getReposRepo();

  let repo = <entities.RepoEntity>await storeRepos
    .findOne({
      project_id: projectId,
      repo_id: repoId
    })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_REPOS_FIND_ONE));

  if (!repo) {
    throw new ServerError({ name: enums.otherErrorsEnum.REPO_NOT_FOUND });
  }

  helper.checkServerTs(repo, serverTs);

  await git
    .commit({
      project_id: projectId,
      repo_id: repoId,
      user_id: userId
    })
    .catch(e => helper.reThrow(e, enums.gitErrorsEnum.GIT_COMMIT));

  let itemStatus = <interfaces.ItemStatus>await git
    .getRepoStatus({
      project_id: projectId,
      repo_id: repoId
    })
    .catch(e => helper.reThrow(e, enums.gitErrorsEnum.GIT_GET_REPO_STATUS));

  repo.status = itemStatus.status;
  repo.conflicts = JSON.stringify(itemStatus.conflicts);
  // repo.nodes not changed
  // repo.struct_id not changed
  // repo.pdts_sorted not changed
  // repo.udfs_content not changed

  // update server_ts

  let newServerTs = helper.makeTs();

  repo.server_ts = newServerTs;

  // save to database

  let connection = getConnection();

  await connection
    .transaction(async manager => {
      await store
        .save({
          manager: manager,
          records: {
            repos: [repo]
          },
          server_ts: newServerTs,
          source_init_id: initId
        })
        .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_SAVE));
    })
    .catch(e => helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_TRANSACTION));

  // response

  let responsePayload: api.CommitRepoResponse200BodyPayload = {
    dev_repo: wrapper.wrapToApiRepo(repo)
  };

  sender.sendClientResponse(req, res, responsePayload);
}
