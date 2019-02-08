import { Request, Response } from 'express';
import { api } from '../../../barrels/api';
import { enums } from '../../../barrels/enums';
import { helper } from '../../../barrels/helper';
import { config } from '../../../barrels/config';
import { constants } from '../../../barrels/constants';
import { sender } from '../../../barrels/sender';
import { store } from '../../../barrels/store';
import { disk } from '../../../barrels/disk';
import { validator } from '../../../barrels/validator';
import { In } from 'typeorm';
import { forEach } from 'p-iteration';

export async function cypressDelete(req: Request, res: Response) {
  let payload: api.CypressDeleteRequestBody['payload'] = validator.getPayload(
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
  let storeProjects = store.getProjectsRepo();

  let storeQueries = store.getQueriesRepo();

  let userIds = payload.user_ids || [];
  let projectIds = payload.project_ids || [];

  if (payload.user_ids && payload.user_ids.length > 0) {
    if (userIds.length > 0) {
      await storeUsers
        .delete({
          user_id: In(userIds)
        })
        .catch(e =>
          helper.reThrow(e, enums.storeErrorsEnum.STORE_USERS_DELETE)
        );
    }

    if (userIds.length > 0) {
      await storeMembers
        .delete({
          member_id: In(userIds),
          project_id: In([constants.DEMO_PROJECT, ...projectIds])
        })
        .catch(e =>
          helper.reThrow(e, enums.storeErrorsEnum.STORE_MEMBERS_DELETE)
        );
    }

    // repos dev - demo and project_ids
    if (userIds.length > 0) {
      await storeRepos
        .delete({
          repo_id: In(userIds),
          project_id: In([constants.DEMO_PROJECT, ...projectIds])
        })
        .catch(e =>
          helper.reThrow(e, enums.storeErrorsEnum.STORE_REPOS_DELETE)
        );
    }

    // repos prod - project_ids
    if (projectIds.length > 0) {
      await storeRepos
        .delete({
          repo_id: constants.PROD_REPO_ID,
          project_id: In([projectIds])
        })
        .catch(e =>
          helper.reThrow(e, enums.storeErrorsEnum.STORE_REPOS_DELETE)
        );
    }

    // files dev - demo and project_ids
    if (userIds.length > 0) {
      await storeFiles
        .delete({
          repo_id: In(userIds),
          project_id: In([constants.DEMO_PROJECT, ...projectIds])
        })
        .catch(e =>
          helper.reThrow(e, enums.storeErrorsEnum.STORE_FILES_DELETE)
        );
    }

    // files prod - project_ids
    if (projectIds.length > 0) {
      await storeFiles
        .delete({
          repo_id: constants.PROD_REPO_ID,
          project_id: In(projectIds)
        })
        .catch(e =>
          helper.reThrow(e, enums.storeErrorsEnum.STORE_FILES_DELETE)
        );
    }

    if (userIds.length > 0) {
      await storeErrors
        .delete({
          repo_id: In(userIds),
          project_id: In([constants.DEMO_PROJECT, ...projectIds])
        })
        .catch(e =>
          helper.reThrow(e, enums.storeErrorsEnum.STORE_ERRORS_DELETE)
        );
    }

    if (userIds.length > 0) {
      await storeDashboards
        .delete({
          repo_id: In(userIds),
          project_id: In([constants.DEMO_PROJECT, ...projectIds])
        })
        .catch(e =>
          helper.reThrow(e, enums.storeErrorsEnum.STORE_DASHBOARDS_DELETE)
        );
    }

    if (userIds.length > 0) {
      await storeMconfigs
        .delete({
          repo_id: In(userIds),
          project_id: In([constants.DEMO_PROJECT, ...projectIds])
        })
        .catch(e =>
          helper.reThrow(e, enums.storeErrorsEnum.STORE_MCONFIGS_DELETE)
        );
    }

    if (userIds.length > 0) {
      await storeModels
        .delete({
          repo_id: In(userIds),
          project_id: In([constants.DEMO_PROJECT, ...projectIds])
        })
        .catch(e =>
          helper.reThrow(e, enums.storeErrorsEnum.STORE_MODELS_DELETE)
        );
    }

    if (projectIds.length > 0) {
      await storeProjects
        .delete({
          project_id: In(projectIds)
        })
        .catch(e =>
          helper.reThrow(e, enums.storeErrorsEnum.STORE_PROJECTS_DELETE)
        );
    }

    // await storeQueries
    //   .delete({
    //     struct_id: item.old_struct_id
    //   })
    //   .catch(e =>
    //     helper.reThrow(e, enums.storeErrorsEnum.STORE_QUERIES_DELETE)
    //   );
  }

  if (userIds.length > 0) {
    await forEach(userIds, async repoId => {
      await disk
        .emptyDir(
          `${config.DISK_BASE_PATH}/${constants.DEMO_PROJECT}/${repoId}`
        )
        .catch(e => helper.reThrow(e, enums.diskErrorsEnum.DISK_EMPTY_DIR));
    });
  }

  if (projectIds.length > 0) {
    await forEach(projectIds, async projectId => {
      await disk
        .removePath(`${config.DISK_BASE_PATH}/${projectId}`)
        .catch(e => helper.reThrow(e, enums.diskErrorsEnum.DISK_REMOVE_PATH));

      await disk
        .removePath(
          `${config.DISK_BIGQUERY_CREDENTIALS_PATH}/${projectId}.json`
        )
        .catch(e => helper.reThrow(e, enums.diskErrorsEnum.DISK_REMOVE_PATH));
    });
  }

  // response

  let responsePayload: api.CypressDeleteResponse200Body['payload'] = {
    empty: true
  };

  res.json({ payload: payload });
}
