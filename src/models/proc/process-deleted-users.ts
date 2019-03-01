import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { store } from '../../barrels/store';
import { MyRegex } from '../../models/my-regex';
import { ServerError } from '../../models/server-error';
import { constants } from '../../barrels/constants';
import { In } from 'typeorm';
import { forEach } from 'p-iteration';
import { disk } from '../../barrels/disk';
import { config } from '../../barrels/config';

export async function processDeletedUsers(userIds: string[]) {
  let storeUsers = store.getUsersRepo();
  let storeMembers = store.getMembersRepo();
  let storeRepos = store.getReposRepo();
  let storeFiles = store.getFilesRepo();
  let storeErrors = store.getErrorsRepo();
  let storeModels = store.getModelsRepo();
  let storeMconfigs = store.getMconfigsRepo();
  let storeDashboards = store.getDashboardsRepo();

  await storeUsers
    .delete({
      user_id: In(userIds)
    })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_USERS_DELETE));

  await storeMembers
    .delete({
      member_id: In(userIds),
      project_id: In([constants.DEMO_PROJECT])
    })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_MEMBERS_DELETE));

  await storeRepos
    .delete({
      repo_id: In(userIds),
      project_id: In([constants.DEMO_PROJECT])
    })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_REPOS_DELETE));

  await storeFiles
    .delete({
      repo_id: In(userIds),
      project_id: In([constants.DEMO_PROJECT])
    })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_FILES_DELETE));

  await storeErrors
    .delete({
      repo_id: In(userIds),
      project_id: In([constants.DEMO_PROJECT])
    })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_ERRORS_DELETE));

  await storeDashboards
    .delete({
      repo_id: In(userIds),
      project_id: In([constants.DEMO_PROJECT])
    })
    .catch(e =>
      helper.reThrow(e, enums.storeErrorsEnum.STORE_DASHBOARDS_DELETE)
    );

  await storeMconfigs
    .delete({
      repo_id: In(userIds),
      project_id: In([constants.DEMO_PROJECT])
    })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_MCONFIGS_DELETE));

  await storeModels
    .delete({
      repo_id: In(userIds),
      project_id: In([constants.DEMO_PROJECT])
    })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_MODELS_DELETE));

  // disk

  await forEach(userIds, async repoId => {
    await disk
      .emptyDir(`${config.DISK_BASE_PATH}/${constants.DEMO_PROJECT}/${repoId}`)
      .catch(e => helper.reThrow(e, enums.diskErrorsEnum.DISK_EMPTY_DIR));
  });
}
