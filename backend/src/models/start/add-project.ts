import { getConnection, In } from 'typeorm';
import { blockml } from '../../barrels/blockml';
import { config } from '../../barrels/config';
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

const { forEach } = require('p-iteration');

export async function addProject(item: {
  project_id: string;
  bigquery_credentials: any;
  member_ids: string[];
}) {
  let projectId = item.project_id;

  let storeProjects = store.getProjectsRepo();

  let dbProject = await storeProjects
    .findOne(projectId)
    .catch(e =>
      helper.reThrow(e, enums.storeErrorsEnum.STORE_PROJECTS_FIND_ONE)
    );

  if (dbProject) {
    return;
  }

  let projectDir = `${config.DISK_BACKEND_PROJECTS_PATH}/${projectId}`;

  await disk
    .ensureDir(projectDir)
    .catch(e => helper.reThrow(e, enums.diskErrorsEnum.DISK_ENSURE_DIR));

  let project: entities.ProjectEntity = generator.makeProject({
    project_id: projectId
  });

  let credentials = JSON.stringify(item.bigquery_credentials);

  let fileAbsoluteId = `${
    config.DISK_BACKEND_BIGQUERY_CREDENTIALS_PATH
  }/${projectId}.json`;

  await disk
    .writeToFile({
      file_absolute_id: fileAbsoluteId,
      content: credentials
    })
    .catch(e => helper.reThrow(e, enums.diskErrorsEnum.DISK_WRITE_TO_FILE));

  let credentialsParsed = JSON.parse(credentials);

  await proc
    .createDataset({
      bigquery_project: credentialsParsed.project_id,
      project_id: projectId,
      credentials_file_path: fileAbsoluteId
    })
    .catch(e => helper.reThrow(e, enums.procErrorsEnum.PROC_CREATE_DATASET));

  project.has_credentials = enums.bEnum.TRUE;
  project.bigquery_credentials = credentials;
  project.bigquery_credentials_file_path = fileAbsoluteId;
  project.bigquery_project = credentialsParsed.project_id;
  project.bigquery_client_email = credentialsParsed.client_email;

  let storeUsers = store.getUsersRepo();

  let users = <entities.UserEntity[]>await storeUsers
    .find({
      user_id: In([item.member_ids])
    })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_USERS_FIND));

  let members: entities.MemberEntity[] = users.map(user =>
    generator.makeMember({
      user: user,
      project_id: projectId,
      is_admin: enums.bEnum.TRUE,
      is_editor: enums.bEnum.TRUE
    })
  );

  let repos: entities.RepoEntity[] = [];
  let files: entities.FileEntity[] = [];
  let dashboards: entities.DashboardEntity[] = [];
  let errors: entities.ErrorEntity[] = [];
  let mconfigs: entities.MconfigEntity[] = [];
  let models: entities.ModelEntity[] = [];
  let views: entities.ViewEntity[] = [];
  let queries: entities.QueryEntity[] = [];

  let isCentralExistOnDisk = <boolean>await disk
    .isRepoExistOnDisk({
      project_id: projectId,
      repo_id: constants.CENTRAL_REPO_ID
    })
    .catch(e =>
      helper.reThrow(e, enums.diskErrorsEnum.DISK_IS_REPO_EXIST_ON_DISK)
    );

  let isProdExistOnDisk = <boolean>await disk
    .isRepoExistOnDisk({
      project_id: projectId,
      repo_id: constants.PROD_REPO_ID
    })
    .catch(e =>
      helper.reThrow(e, enums.diskErrorsEnum.DISK_IS_REPO_EXIST_ON_DISK)
    );

  if (!isCentralExistOnDisk || !isProdExistOnDisk) {
    await git
      .prepareCentralAndProd({ project_id: projectId, use_data: true })
      .catch(e =>
        helper.reThrow(e, enums.gitErrorsEnum.GIT_PREPARE_CENTRAL_AND_PROD)
      );
  }

  // prod

  let itemCatalogProd = <interfaces.ItemCatalog>(
    await disk.getRepoCatalogNodesAndFiles({
      project_id: projectId,
      repo_id: constants.PROD_REPO_ID
    })
  );

  let prodStructId = helper.makeId();

  let prodRepo: entities.RepoEntity = generator.makeRepo({
    project_id: projectId,
    repo_id: constants.PROD_REPO_ID,
    nodes: itemCatalogProd.nodes,
    struct_id: prodStructId
  });

  let itemStruct = <interfaces.ItemStruct>await blockml
    .rebuildStruct({
      files: itemCatalogProd.files,
      project_id: projectId,
      repo_id: constants.PROD_REPO_ID,
      bigquery_project: project.bigquery_project,
      week_start: <any>project.week_start,
      struct_id: prodStructId
    })
    .catch(e =>
      helper.reThrow(e, enums.blockmlErrorsEnum.BLOCKML_REBUILD_STRUCT)
    );

  let {
    pdts_sorted: prodPdtsSorted,
    udfs_content: prodUdfsContent,
    dashboards: prodDashboards,
    errors: prodErrors,
    mconfigs: prodMconfigs,
    models: prodModels,
    views: prodViews,
    queries: prodQueries
  } = itemStruct;

  prodRepo.pdts_sorted = prodPdtsSorted;
  prodRepo.udfs_content = prodUdfsContent;

  repos.push(prodRepo);

  files = helper.makeNewArray(files, itemCatalogProd.files);
  dashboards = helper.makeNewArray(dashboards, prodDashboards);
  errors = helper.makeNewArray(errors, prodErrors);
  mconfigs = helper.makeNewArray(mconfigs, prodMconfigs);
  models = helper.makeNewArray(models, prodModels);
  views = helper.makeNewArray(views, prodViews);
  queries = helper.makeNewArray(queries, prodQueries);

  // dev repos

  let memberIds = members.map(member => member.member_id);

  await forEach(memberIds, async (repoId: string) => {
    let repoDir = `${config.DISK_BACKEND_PROJECTS_PATH}/${projectId}/${repoId}`;

    await disk
      .emptyDir(repoDir)
      .catch(e => helper.reThrow(e, enums.diskErrorsEnum.DISK_EMPTY_DIR));

    await git
      .cloneCentralToDev({
        project_id: projectId,
        dev_repo_id: repoId
      })
      .catch(e =>
        helper.reThrow(e, enums.gitErrorsEnum.GIT_CLONE_CENTRAL_TO_DEV)
      );

    let itemCatalogRepo = <interfaces.ItemCatalog>(
      await disk.getRepoCatalogNodesAndFiles({
        project_id: projectId,
        repo_id: repoId
      })
    );

    let repo: entities.RepoEntity = generator.makeRepo({
      project_id: projectId,
      repo_id: repoId,
      nodes: itemCatalogRepo.nodes,
      struct_id: prodStructId // from prod
    });

    repo.pdts_sorted = prodRepo.pdts_sorted;
    repo.udfs_content = prodRepo.udfs_content;

    repos.push(repo);

    files = helper.makeNewArray(files, itemCatalogRepo.files);

    let structCopyItem = copier.copyStructFromElements(repoId, {
      models: prodModels,
      views: prodViews,
      dashboards: prodDashboards,
      mconfigs: prodMconfigs,
      errors: prodErrors
    });

    let {
      dashboards: repoDashboards,
      models: repoModels,
      views: repoViews,
      errors: repoErrors,
      mconfigs: repoMconfigs
    } = structCopyItem;

    dashboards = helper.makeNewArray(dashboards, repoDashboards);
    errors = helper.makeNewArray(errors, repoErrors);
    mconfigs = helper.makeNewArray(mconfigs, repoMconfigs);
    models = helper.makeNewArray(models, repoModels);
    views = helper.makeNewArray(views, repoViews);
  });

  // update server_ts

  let newServerTs = helper.makeTs();

  project.server_ts = newServerTs;
  repos = helper.refreshServerTs(repos, newServerTs);
  files = helper.refreshServerTs(files, newServerTs);
  queries = helper.refreshServerTs(queries, newServerTs);
  models = helper.refreshServerTs(models, newServerTs);
  views = helper.refreshServerTs(views, newServerTs);
  mconfigs = helper.refreshServerTs(mconfigs, newServerTs);
  dashboards = helper.refreshServerTs(dashboards, newServerTs);
  errors = helper.refreshServerTs(errors, newServerTs);
  members = helper.refreshServerTs(members, newServerTs);

  // save to database

  let connection = getConnection();

  await connection
    .transaction(async manager => {
      await store
        .insert({
          manager: manager,
          records: {
            projects: [project],
            repos: repos,
            files: files,
            queries: queries,
            models: models,
            views: views,
            mconfigs: mconfigs,
            dashboards: dashboards,
            errors: errors,
            members: members
          },
          skip_chunk: true, // no sessions needs to be updated on server start
          server_ts: newServerTs,
          source_init_id: undefined
        })
        .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_INSERT));
    })
    .catch(e => helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_TRANSACTION));
}
