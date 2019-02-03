import { Request, Response } from 'express';
import { api } from '../../../barrels/api';
import { enums } from '../../../barrels/enums';
import { helper } from '../../../barrels/helper';
import { handler } from '../../../barrels/handler';
import { constants } from '../../../barrels/constants';
import { sender } from '../../../barrels/sender';
import { interfaces } from '../../../barrels/interfaces';
import { copier } from '../../../barrels/copier';
import { store } from '../../../barrels/store';
import { disk } from '../../../barrels/disk';
import { validator } from '../../../barrels/validator';
import { In, getConnection } from 'typeorm';
import { forEach } from 'p-iteration';
import { entities } from '../../../barrels/entities';
import * as crypto from 'crypto';
import { proc } from '../../../barrels/proc';
import { generator } from '../../../barrels/generator';
import { ServerError } from '../../../models/server-error';
import { git } from '../../../barrels/git';

export async function cypressSeed(req: Request, res: Response) {
  let payload: api.CypressSeedRequestBody['payload'] = validator.getPayload(
    req
  );

  let storeUsers = store.getUsersRepo();
  let storeMembers = store.getMembersRepo();
  let storeRepos = store.getReposRepo();
  let storeFiles = store.getFilesRepo();
  let storeErrors = store.getErrorsRepo();
  let storeModels = store.getModelsRepo();
  let storeMconfigs = store.getMconfigsRepo();
  let storeDashboards = store.getDashboardsRepo();

  let users: entities.UserEntity[] = [];
  let members: entities.MemberEntity[] = [];

  let repos: entities.RepoEntity[] = [];
  let files: entities.FileEntity[] = [];

  let dashboards: entities.DashboardEntity[] = [];
  let errors: entities.ErrorEntity[] = [];
  let mconfigs: entities.MconfigEntity[] = [];
  let models: entities.ModelEntity[] = [];

  if (payload.users) {
    await forEach(payload.users, async x => {
      let salt = x.password
        ? crypto.randomBytes(16).toString('hex')
        : undefined;

      let hash = x.password
        ? crypto
            .pbkdf2Sync(x.password, salt, 1000, 64, 'sha512')
            .toString('hex')
        : undefined;

      let alias = <string>(
        await proc
          .findAlias(x.user_id)
          .catch(e => helper.reThrow(e, enums.procErrorsEnum.PROC_FIND_ALIAS))
      );

      let newUser = generator.makeUser({
        user_id: x.user_id,
        email_verified: helper.booleanToBenum(x.email_verified),
        email_verification_token: x.email_verification_token,
        password_reset_token: x.password_reset_token,
        password_reset_expires_ts: x.password_reset_token
          ? helper.makeTsOffset(86400000)
          : undefined,
        salt: salt,
        hash: hash,
        alias: alias
      });

      users.push(newUser);

      // demo

      let memberId = newUser.user_id;

      let demoMember = generator.makeMember({
        user: newUser,
        project_id: constants.DEMO_PROJECT,
        is_editor: enums.bEnum.TRUE,
        is_admin: enums.bEnum.FALSE
      });

      let demoProdRepo = await storeRepos
        .findOne({
          project_id: constants.DEMO_PROJECT,
          repo_id: constants.PROD_REPO_ID
        })
        .catch(e =>
          helper.reThrow(e, enums.storeErrorsEnum.STORE_REPOS_FIND_ONE)
        );

      if (!demoProdRepo) {
        throw new ServerError({ name: enums.otherErrorsEnum.REPO_NOT_FOUND });
      }

      await git
        .cloneCentralToDev({
          project_id: constants.DEMO_PROJECT,
          dev_repo_id: memberId
        })
        .catch(e =>
          helper.reThrow(e, enums.gitErrorsEnum.GIT_CLONE_CENTRAL_TO_DEV)
        );

      let itemDemoDevCatalog = <interfaces.ItemCatalog>await disk
        .getRepoCatalogNodesAndFiles({
          project_id: constants.DEMO_PROJECT,
          repo_id: memberId
        })
        .catch(e =>
          helper.reThrow(
            e,
            enums.diskErrorsEnum.DISK_GET_REPO_CATALOG_NODES_AND_FILES
          )
        );

      let demoDevRepo: entities.RepoEntity = generator.makeRepo({
        project_id: constants.DEMO_PROJECT,
        repo_id: memberId,
        nodes: itemDemoDevCatalog.nodes,
        struct_id: demoProdRepo.struct_id // from prod
      });

      demoDevRepo.pdts_sorted = demoProdRepo.pdts_sorted;
      demoDevRepo.udfs_content = demoProdRepo.udfs_content;

      let itemDemoStructCopy = <interfaces.ItemStructCopy>await copier
        .copyStructFromDatabase({
          project_id: constants.DEMO_PROJECT,
          from_repo_id: constants.PROD_REPO_ID,
          to_repo_id: memberId
        })
        .catch(e =>
          helper.reThrow(
            e,
            enums.copierErrorsEnum.COPIER_COPY_STRUCT_FROM_DATABASE
          )
        );

      let {
        dashboards: demoDevDashboards,
        models: demoDevModels,
        errors: demoDevErrors,
        mconfigs: demoDevMconfigs
      } = itemDemoStructCopy;

      members.push(demoMember);
      repos.push(demoDevRepo);

      files = helper.makeNewArray(files, itemDemoDevCatalog.files);
      models = helper.makeNewArray(models, demoDevModels);
      mconfigs = helper.makeNewArray(mconfigs, demoDevMconfigs);
      dashboards = helper.makeNewArray(dashboards, demoDevDashboards);
      errors = helper.makeNewArray(errors, demoDevErrors);
    });
  }

  // update server_ts

  let newServerTs = helper.makeTs();

  users = helper.refreshServerTs(users, newServerTs);
  members = helper.refreshServerTs(members, newServerTs);
  repos = helper.refreshServerTs(repos, newServerTs);
  files = helper.refreshServerTs(files, newServerTs);
  models = helper.refreshServerTs(models, newServerTs);
  mconfigs = helper.refreshServerTs(mconfigs, newServerTs);
  dashboards = helper.refreshServerTs(dashboards, newServerTs);
  errors = helper.refreshServerTs(errors, newServerTs);

  // save to database

  let connection = getConnection();

  await connection
    .transaction(async manager => {
      await store
        .insert({
          manager: manager,
          records: {
            users: users,
            members: members,
            repos: repos,
            files: files,
            models: models,
            mconfigs: mconfigs,
            dashboards: dashboards,
            errors: errors
          },
          skip_chunk: true,
          server_ts: newServerTs,
          source_init_id: undefined
        })
        .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_INSERT));
    })
    .catch(e => helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_TRANSACTION));

  // response

  let responsePayload: api.CypressSeedResponse200Body['payload'] = {
    empty: true
  };

  res.json({ payload: payload });
}
