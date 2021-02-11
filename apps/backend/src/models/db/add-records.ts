import { EntityManager } from 'typeorm';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { repositories } from '~backend/barrels/repositories';

export async function addRecords(item: {
  manager: EntityManager;
  // sourceInitId: string;
  // skipChunk?: boolean;
  records: {
    users?: entities.UserEntity[];
    orgs?: entities.OrgEntity[];
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

  // if (!item.skip_chunk) {
  //   let chunkId = common.makeId();

  //   let chunk = gen.makeChunk({
  //     chunk_id: chunkId,
  //     records: item.records,
  //     source_session_id: item.source_init_id,
  //     server_ts: item.server_ts
  //   });

  //   let storeChunks = getChunksRepo(manager);

  //   await storeChunks
  //     .insert(chunk)
  //     .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_CHUNKS_INSERT));
  // }

  let users = records.users;
  let orgs = records.orgs;
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

  if (common.isDefined(users) && users.length > 0) {
    await manager
      .getCustomRepository(repositories.UsersRepository)
      .insert(users);
  }

  if (common.isDefined(orgs) && orgs.length > 0) {
    await manager.getCustomRepository(repositories.OrgsRepository).insert(orgs);
  }

  // if (projects && projects.length > 0) {
  //   let storeProjects = getProjectsRepo(manager);

  //   await storeProjects
  //     .insert(projects)
  //     .catch(e =>
  //       helper.reThrow(e, enums.storeErrorsEnum.STORE_PROJECTS_INSERT)
  //     );
  // }

  // if (repos && repos.length > 0) {
  //   let storeRepos = getReposRepo(manager);

  //   await storeRepos
  //     .insert(repos)
  //     .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_REPOS_INSERT));
  // }

  // if (files && files.length > 0) {
  //   let storeFiles = getFilesRepo(manager);

  //   await storeFiles
  //     .insert(files)
  //     .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_FILES_INSERT));
  // }

  // if (queries && queries.length > 0) {
  //   let storeQueries = getQueriesRepo(manager);

  //   await storeQueries
  //     .insert(queries)
  //     .catch(e =>
  //       helper.reThrow(e, enums.storeErrorsEnum.STORE_QUERIES_INSERT)
  //     );
  // }

  // if (models && models.length > 0) {
  //   let storeModels = getModelsRepo(manager);

  //   await storeModels
  //     .insert(models)
  //     .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_MODELS_INSERT));
  // }

  // if (views && views.length > 0) {
  //   let storeViews = getViewsRepo(manager);

  //   await storeViews
  //     .insert(views)
  //     .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_VIEWS_INSERT));
  // }

  // if (mconfigs && mconfigs.length > 0) {
  //   let storeMconfigs = getMconfigsRepo(manager);

  //   await storeMconfigs
  //     .insert(mconfigs)
  //     .catch(e =>
  //       helper.reThrow(e, enums.storeErrorsEnum.STORE_MCONFIGS_INSERT)
  //     );
  // }

  // if (dashboards && dashboards.length > 0) {
  //   let storeDashboards = getDashboardsRepo(manager);

  //   await storeDashboards
  //     .insert(dashboards)
  //     .catch(e =>
  //       helper.reThrow(e, enums.storeErrorsEnum.STORE_DASHBOARDS_INSERT)
  //     );
  // }

  // if (errors && errors.length > 0) {
  //   let storeErrors = getErrorsRepo(manager);

  //   await storeErrors
  //     .insert(errors)
  //     .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_ERRORS_INSERT));
  // }

  // if (members && members.length > 0) {
  //   let storeMembers = getMembersRepo(manager);

  //   await storeMembers
  //     .insert(members)
  //     .catch(e =>
  //       helper.reThrow(e, enums.storeErrorsEnum.STORE_MEMBERS_INSERT)
  //     );
  // }
}
