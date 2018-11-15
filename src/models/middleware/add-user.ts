import { getConnection } from 'typeorm';
import { api } from '../../barrels/api';
import { constants } from '../../barrels/constants';
import { copier } from '../../barrels/copier';
import { disk } from '../../barrels/disk';
import { entities } from '../../barrels/entities';
import { enums } from '../../barrels/enums';
import { generator } from '../../barrels/generator';
import { git } from '../../barrels/git';
import { helper } from '../../barrels/helper';
import { interfaces } from '../../barrels/interfaces';
import { proc } from '../../barrels/proc';
import { store } from '../../barrels/store';
import { validator } from '../../barrels/validator';
import { ServerError } from '../server-error';

export async function addUser(req: any, res: any, next: any) {
  let initId = validator.getRequestInfoInitId(req);

  let userId: string;

  try {
    userId = req.user.email;
    if (helper.isNullOrEmpty(userId)) {
      throw new Error();
    }
  } catch (e) {
    throw new ServerError({ name: enums.otherErrorsEnum.AUTHORIZATION_EMAIL });
  }

  if (helper.isNotNullAndNotEmpty(userId)) {
    let storeUsers = store.getUsersRepo();

    let user = <entities.UserEntity>(
      await storeUsers
        .findOne(userId)
        .catch(e =>
          helper.reThrow(e, enums.storeErrorsEnum.STORE_USERS_FIND_ONE)
        )
    );

    if (!user) {
      let alias = await proc.findAlias(userId);

      let newUser = generator.makeUser({
        user_id: userId,
        alias: alias,
        status: api.UserStatusEnum.Active
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
        .catch(e =>
          helper.reThrow(e, enums.storeErrorsEnum.STORE_REPOS_FIND_ONE)
        );

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
          helper.reThrow(
            e,
            enums.copierErrorsEnum.COPIER_COPY_STRUCT_FROM_DATABASE
          )
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
      itemCatalog.files = helper.refreshServerTs(
        itemCatalog.files,
        newServerTs
      );
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
              source_init_id: initId
            })
            .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_INSERT));
        })
        .catch(e =>
          helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_TRANSACTION)
        );
    } else if (user.status !== api.UserStatusEnum.Active) {
      user.status = api.UserStatusEnum.Active;

      let storeMembers = store.getMembersRepo();

      let userMembers = <entities.MemberEntity[]>await storeMembers
        .find({
          member_id: userId
        })
        .catch(e =>
          helper.reThrow(e, enums.storeErrorsEnum.STORE_MEMBERS_FIND)
        );

      userMembers = userMembers.map(member => {
        member.status = api.UserStatusEnum.Active;
        return member;
      });

      // update server_ts B

      let newServerTs = helper.makeTs();

      user.server_ts = newServerTs;
      userMembers = helper.refreshServerTs(userMembers, newServerTs);

      // save to database B

      let connection = getConnection();

      await connection
        .transaction(async manager => {
          await store
            .save({
              manager: manager,
              records: {
                users: [user],
                members: userMembers
              },
              server_ts: newServerTs,
              source_init_id: undefined
            })
            .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_SAVE));
        })
        .catch(e =>
          helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_TRANSACTION)
        );
    }

    next();
  }
}
