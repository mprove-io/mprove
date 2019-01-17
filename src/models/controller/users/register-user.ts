import { Request, Response } from 'express';
import { api } from '../../../barrels/api';
import { sender } from '../../../barrels/sender';
import { validator } from '../../../barrels/validator';
import { proc } from '../../../barrels/proc';
import { generator } from '../../../barrels/generator';

import * as crypto from 'crypto';
import { constants } from '../../../barrels/constants';
import { enums } from '../../../barrels/enums';
import { auth } from '../../../barrels/auth';
import { store } from '../../../barrels/store';
import { entities } from '../../../barrels/entities';
import { helper } from '../../../barrels/helper';
import { ServerError } from '../../server-error';
import { git } from '../../../barrels/git';
import { interfaces } from '../../../barrels/interfaces';
import { disk } from '../../../barrels/disk';
import { copier } from '../../../barrels/copier';
import { getConnection } from 'typeorm';

export async function registerUser(req: Request, res: Response) {
  let payload: api.RegisterUserRequestBodyPayload = validator.getPayload(req);

  let userId = payload.user_id;
  let password = payload.password;

  let storeUsers = store.getUsersRepo();

  let user = <entities.UserEntity>(
    await storeUsers
      .findOne(userId)
      .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_USERS_FIND_ONE))
  );

  if (user) {
    throw new ServerError({
      name: enums.otherErrorsEnum.REGISTER_ERROR_USER_ALREADY_EXISTS
    });
  }

  let alias = await proc.findAlias(userId);

  let salt = crypto.randomBytes(16).toString('hex');
  let hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
    .toString('hex');

  let newUser = generator.makeUser({
    user_id: userId,
    email_verified: enums.bEnum.FALSE,
    hash: hash,
    salt: salt,
    alias: alias,
    status: api.UserStatusEnum.Pending
  });

  let newMember = generator.makeMember({
    user: newUser,
    project_id: constants.DEMO_PROJECT,
    is_admin: enums.bEnum.FALSE,
    is_editor: enums.bEnum.TRUE
  });

  let storeRepos = store.getReposRepo();

  let prodRepo = <entities.RepoEntity>await storeRepos
    .findOne({
      project_id: constants.DEMO_PROJECT,
      repo_id: constants.PROD_REPO_ID
    })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_REPOS_FIND_ONE));

  if (!prodRepo) {
    throw new ServerError({ name: enums.otherErrorsEnum.REPO_NOT_FOUND });
  }

  let repoId = userId;

  await git
    .cloneCentralToDev({
      project_id: constants.DEMO_PROJECT,
      dev_repo_id: repoId
    })
    .catch(e =>
      helper.reThrow(e, enums.gitErrorsEnum.GIT_CLONE_CENTRAL_TO_DEV)
    );

  let itemCatalog = <interfaces.ItemCatalog>await disk
    .getRepoCatalogNodesAndFiles({
      project_id: constants.DEMO_PROJECT,
      repo_id: repoId
    })
    .catch(e =>
      helper.reThrow(
        e,
        enums.diskErrorsEnum.DISK_GET_REPO_CATALOG_NODES_AND_FILES
      )
    );

  let repo: entities.RepoEntity = generator.makeRepo({
    project_id: constants.DEMO_PROJECT,
    repo_id: repoId,
    nodes: itemCatalog.nodes,
    struct_id: prodRepo.struct_id // from prod
  });

  repo.pdts_sorted = prodRepo.pdts_sorted;
  repo.udfs_content = prodRepo.udfs_content;

  let itemStructCopy = <interfaces.ItemStructCopy>await copier
    .copyStructFromDatabase({
      project_id: constants.DEMO_PROJECT,
      from_repo_id: constants.PROD_REPO_ID,
      to_repo_id: repoId
    })
    .catch(e =>
      helper.reThrow(e, enums.copierErrorsEnum.COPIER_COPY_STRUCT_FROM_DATABASE)
    );

  let {
    dashboards: repoDashboards,
    models: repoModels,
    errors: repoErrors,
    mconfigs: repoMconfigs
  } = itemStructCopy;

  // update server_ts A

  let newServerTs = helper.makeTs();

  newUser.server_ts = newServerTs;
  newMember.server_ts = newServerTs;
  repo.server_ts = newServerTs;
  itemCatalog.files = helper.refreshServerTs(itemCatalog.files, newServerTs);
  repoModels = helper.refreshServerTs(repoModels, newServerTs);
  repoDashboards = helper.refreshServerTs(repoDashboards, newServerTs);
  repoMconfigs = helper.refreshServerTs(repoMconfigs, newServerTs);
  repoErrors = helper.refreshServerTs(repoErrors, newServerTs);

  // save to database A

  let connection = getConnection();

  await connection
    .transaction(async manager => {
      await store
        .insert({
          manager: manager,
          records: {
            users: [newUser],
            members: [newMember],
            repos: [repo],
            files: itemCatalog.files,
            models: repoModels,
            dashboards: repoDashboards,
            mconfigs: repoMconfigs,
            errors: repoErrors
          },
          server_ts: newServerTs,
          skip_chunk: true,
          source_init_id: undefined
        })
        .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_INSERT));
    })
    .catch(e => helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_TRANSACTION));

  let responsePayload: api.RegisterUserResponse200BodyPayload = {
    user_id: userId
  };

  sender.sendClientResponse(req, res, responsePayload);
}
