import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { store } from '../../barrels/store';
import { MyRegex } from '../../models/my-regex';
import { ServerError } from '../../models/server-error';
import { In } from 'typeorm';
import { forEach } from 'p-iteration';
import { disk } from '../../barrels/disk';
import { config } from '../../barrels/config';

export async function processDeletedProjects(projectIds: string[]) {
  let storeMembers = store.getMembersRepo();
  let storeRepos = store.getReposRepo();
  let storeFiles = store.getFilesRepo();
  let storeErrors = store.getErrorsRepo();
  let storeModels = store.getModelsRepo();
  let storeViews = store.getViewsRepo();
  let storeMconfigs = store.getMconfigsRepo();
  let storeDashboards = store.getDashboardsRepo();
  let storeProjects = store.getProjectsRepo();

  await storeMembers
    .delete({
      project_id: In(projectIds)
    })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_MEMBERS_DELETE));

  await storeRepos
    .delete({
      project_id: In(projectIds)
    })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_REPOS_DELETE));

  await storeFiles
    .delete({
      project_id: In(projectIds)
    })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_FILES_DELETE));

  await storeErrors
    .delete({
      project_id: In(projectIds)
    })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_ERRORS_DELETE));

  await storeDashboards
    .delete({
      project_id: In(projectIds)
    })
    .catch(e =>
      helper.reThrow(e, enums.storeErrorsEnum.STORE_DASHBOARDS_DELETE)
    );

  await storeMconfigs
    .delete({
      project_id: In(projectIds)
    })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_MCONFIGS_DELETE));

  await storeModels
    .delete({
      project_id: In([projectIds])
    })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_MODELS_DELETE));

  await storeViews
    .delete({
      project_id: In([projectIds])
    })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_VIEWS_DELETE));

  await storeProjects
    .delete({
      project_id: In(projectIds)
    })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_PROJECTS_DELETE));

  // disk

  await forEach(projectIds, async projectId => {
    await disk
      .removePath(`${config.DISK_BACKEND_PROJECTS_PATH}/${projectId}`)
      .catch(e => helper.reThrow(e, enums.diskErrorsEnum.DISK_REMOVE_PATH));

    await disk
      .removePath(
        `${config.DISK_BACKEND_BIGQUERY_CREDENTIALS_PATH}/${projectId}.json`
      )
      .catch(e => helper.reThrow(e, enums.diskErrorsEnum.DISK_REMOVE_PATH));
  });
}
