import { getConnection } from 'typeorm';
import { entities } from '../../barrels/entities';
import { constants } from '../../barrels/constants';
import { interfaces } from '../../barrels/interfaces';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { copier } from '../../barrels/copier';
import { git } from '../../barrels/git';
import { disk } from '../../barrels/disk';
import { store } from '../../barrels/store';
import { generator } from '../../barrels/generator';
import { ServerError } from '../server-error';
import { UserEntity } from '../store/entities/_index';

export async function addMemberToDemo(user: UserEntity) {
  let userId = user.user_id;

  let newMember = generator.makeMember({
    user: user,
    project_id: constants.DEMO_PROJECT,
    is_admin: enums.bEnum.FALSE,
    is_editor: enums.bEnum.TRUE
  });

  let newServerTs = helper.makeTs();

  // update server_ts

  newMember.server_ts = newServerTs;

  // save to database

  let connectionA = getConnection();

  await connectionA
    .transaction(async manager => {
      await store
        .insert({
          manager: manager,
          records: {
            members: [newMember]
          },
          server_ts: newServerTs,
          source_init_id: undefined
        })
        .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_INSERT));
    })
    .catch(e => helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_TRANSACTION));

  // continue

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

  // update server_ts

  repo.server_ts = newServerTs;
  itemCatalog.files = helper.refreshServerTs(itemCatalog.files, newServerTs);
  repoModels = helper.refreshServerTs(repoModels, newServerTs);
  repoDashboards = helper.refreshServerTs(repoDashboards, newServerTs);
  repoMconfigs = helper.refreshServerTs(repoMconfigs, newServerTs);
  repoErrors = helper.refreshServerTs(repoErrors, newServerTs);

  // save to database

  let connectionB = getConnection();

  await connectionB
    .transaction(async manager => {
      await store
        .insert({
          manager: manager,
          records: {
            repos: [repo],
            files: itemCatalog.files,
            models: repoModels,
            dashboards: repoDashboards,
            mconfigs: repoMconfigs,
            errors: repoErrors
          },
          server_ts: newServerTs,
          source_init_id: undefined
        })
        .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_INSERT));
    })
    .catch(e => helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_TRANSACTION));
}
