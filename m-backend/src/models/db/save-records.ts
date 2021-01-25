import { helper } from '~/barrels/helper';
import { EntityManager } from 'typeorm';
import { entities } from '~/barrels/entities';

import { repositories } from '~/barrels/repositories';

export async function saveRecords(item: {
  manager: EntityManager;
  // sourceInitId: string;
  // skipChunk?: boolean;
  records: {
    users?: entities.UserEntity[];
    // projects?: entities.ProjectEntity[];
    // repos?: entities.RepoEntity[];
    // files?: entities.FileEntity[];
    // queries?: entities.QueryEntity[];
    // models?: entities.ModelEntity[];
    // views?: entities.ViewEntity[];
    // mconfigs?: entities.MconfigEntity[];
    // dashboards?: entities.DashboardEntity[];
    // errors?: entities.ErrorEntity[];
    // members?: entities.MemberEntity[];
  };
}) {
  let { manager, records } = item;

  let newServerTs = helper.makeTs();

  Object.keys(records).forEach(key => {
    helper.refreshServerTs(records[key], newServerTs);
  });

  // if (!item.skipChunk) {
  //   let chunkId = helper.makeId();

  //   let chunk = generator.makeChunk({
  //     chunk_id: chunkId,
  //     records: item.records,
  //     source_session_id: item.sourceInitId,
  //     server_ts: item.serverTs
  //   });

  //   let storeChunks = getChunksRepo(manager);

  //   await storeChunks
  //     .insert(chunk)
  //     .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_CHUNKS_INSERT));
  // }

  let users = records.users;
  // let projects = records.projects;
  // let repos = records.repos;
  // let files = records.files;
  // let queries = records.queries;
  // let models = records.models;
  // let views = records.views;
  // let mconfigs = records.mconfigs;
  // let dashboards = records.dashboards;
  // let errors = records.errors;
  // let members = records.members;

  if (helper.isDefined(users) && users.length > 0) {
    let storeUsers = manager.getCustomRepository(repositories.UserRepository);

    await storeUsers.save(users);
  }

  // if (projects && projects.length > 0) {
  //   let storeProjects = getProjectsRepo(manager);

  //   await storeProjects
  //     .save(projects)
  //     .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_PROJECTS_SAVE));
  // }

  // if (repos && repos.length > 0) {
  //   let storeRepos = getReposRepo(manager);

  //   await storeRepos
  //     .save(repos)
  //     .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_REPOS_SAVE));
  // }

  // if (files && files.length > 0) {
  //   let storeFiles = getFilesRepo(manager);

  //   await storeFiles
  //     .save(files)
  //     .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_FILES_SAVE));
  // }

  // if (queries && queries.length > 0) {
  //   let storeQueries = getQueriesRepo(manager);

  //   await storeQueries
  //     .save(queries)
  //     .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_QUERIES_SAVE));
  // }

  // if (models && models.length > 0) {
  //   let storeModels = getModelsRepo(manager);

  //   await storeModels
  //     .save(models)
  //     .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_MODELS_SAVE));
  // }

  // if (views && views.length > 0) {
  //   let storeViews = getViewsRepo(manager);

  //   await storeViews
  //     .save(views)
  //     .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_VIEWS_SAVE));
  // }

  // if (mconfigs && mconfigs.length > 0) {
  //   let storeMconfigs = getMconfigsRepo(manager);

  //   await storeMconfigs
  //     .save(mconfigs)
  //     .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_MCONFIGS_SAVE));
  // }

  // if (dashboards && dashboards.length > 0) {
  //   let storeDashboards = getDashboardsRepo(manager);

  //   await storeDashboards
  //     .save(dashboards)
  //     .catch(e =>
  //       helper.reThrow(e, enums.storeErrorsEnum.STORE_DASHBOARDS_SAVE)
  //     );
  // }

  // if (errors && errors.length > 0) {
  //   let storeErrors = getErrorsRepo(manager);

  //   await storeErrors
  //     .save(errors)
  //     .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_ERRORS_SAVE));
  // }

  // if (members && members.length > 0) {
  //   let storeMembers = getMembersRepo(manager);

  //   await storeMembers
  //     .save(members)
  //     .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_MEMBERS_SAVE));
  // }
}
