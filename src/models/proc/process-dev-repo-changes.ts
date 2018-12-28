import { getConnection } from 'typeorm';
import { blockml } from '../../barrels/blockml';
import { disk } from '../../barrels/disk';
import { entities } from '../../barrels/entities';
import { enums } from '../../barrels/enums';
import { git } from '../../barrels/git';
import { helper } from '../../barrels/helper';
import { interfaces } from '../../barrels/interfaces';
import { store } from '../../barrels/store';
import { ServerError } from '../server-error';
import { findDifferencesInFiles } from './find-differences-in-files';

export async function processDevRepoChanges(item: {
  project_id: string;
  repo_id: string;
  dev_repo: entities.RepoEntity;
  init_id: string;
}): Promise<interfaces.ItemProcessDevRepoChanges> {
  let projectId = item.project_id;
  let repo = item.dev_repo;

  let storeProjects = store.getProjectsRepo();

  let project = <entities.ProjectEntity>(
    await storeProjects
      .findOne(projectId)
      .catch(e =>
        helper.reThrow(e, enums.storeErrorsEnum.STORE_PROJECTS_FIND_ONE)
      )
  );

  if (!project) {
    throw new ServerError({ name: enums.otherErrorsEnum.PROJECT_NOT_FOUND });
  }

  let oldStructId = repo.struct_id;
  let newStructId = helper.makeId();

  let itemStatus = <interfaces.ItemStatus>await git
    .getRepoStatus({
      project_id: projectId,
      repo_id: item.repo_id
    })
    .catch(e => helper.reThrow(e, enums.gitErrorsEnum.GIT_GET_REPO_STATUS));

  let itemCatalog = <interfaces.ItemCatalog>await disk
    .getRepoCatalogNodesAndFiles({
      project_id: projectId,
      repo_id: item.repo_id
    })
    .catch(e =>
      helper.reThrow(
        e,
        enums.diskErrorsEnum.DISK_GET_REPO_CATALOG_NODES_AND_FILES
      )
    );

  let filesItem = <interfaces.ItemFiles>await findDifferencesInFiles({
    project_id: projectId,
    repo_id: item.repo_id,
    repo_disk_files: itemCatalog.files
  }).catch(e =>
    helper.reThrow(e, enums.procErrorsEnum.PROC_FIND_DIFFERENCES_IN_FILES)
  );

  let itemStruct = <interfaces.ItemStruct>await blockml
    .rebuildStruct({
      files: itemCatalog.files,
      project_id: projectId,
      repo_id: item.repo_id,
      bq_project: project.bigquery_project,
      week_start: <any>project.week_start,
      struct_id: newStructId
    })
    .catch(e =>
      helper.reThrow(e, enums.blockmlErrorsEnum.BLOCKML_REBUILD_STRUCT)
    );

  repo.nodes = JSON.stringify(itemCatalog.nodes);
  repo.conflicts = JSON.stringify(itemStatus.conflicts);
  repo.status = itemStatus.status;
  repo.struct_id = newStructId;
  repo.pdts_sorted = itemStruct.pdts_sorted;
  repo.udfs_content = itemStruct.udfs_content;

  // update server_ts

  let newServerTs = helper.makeTs();

  repo.server_ts = newServerTs;
  filesItem.new_files = helper.refreshServerTs(
    filesItem.new_files,
    newServerTs
  );
  filesItem.changed_files = helper.refreshServerTs(
    filesItem.changed_files,
    newServerTs
  );
  filesItem.deleted_files = helper.refreshServerTs(
    filesItem.deleted_files,
    newServerTs
  );
  itemStruct.models = helper.refreshServerTs(itemStruct.models, newServerTs);
  itemStruct.dashboards = helper.refreshServerTs(
    itemStruct.dashboards,
    newServerTs
  );
  itemStruct.mconfigs = helper.refreshServerTs(
    itemStruct.mconfigs,
    newServerTs
  );
  itemStruct.errors = helper.refreshServerTs(itemStruct.errors, newServerTs);
  itemStruct.queries = helper.refreshServerTs(itemStruct.queries, newServerTs);

  // save to database

  let connection = getConnection();

  await connection
    .transaction(async manager => {
      await store
        .save({
          manager: manager,
          records: {
            repos: [repo],
            files: helper.makeNewArray(
              filesItem.new_files,
              filesItem.changed_files,
              filesItem.deleted_files
            ),
            models: itemStruct.models,
            dashboards: itemStruct.dashboards,
            mconfigs: itemStruct.mconfigs,
            errors: itemStruct.errors,
            queries: itemStruct.queries
          },
          server_ts: newServerTs,
          source_init_id: item.init_id
        })
        .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_SAVE));

      if (filesItem.deleted_files.length > 0) {
        // use custom transaction to not check length

        let deletedFilesIds = filesItem.deleted_files.map(
          file => file.file_absolute_id
        );

        let storeFilesTrans = store.getFilesRepo(manager);

        await storeFilesTrans
          .delete(deletedFilesIds)
          .catch(e =>
            helper.reThrow(e, enums.storeErrorsEnum.STORE_FILES_DELETE)
          );
      }

      await store
        .deleteOldStruct(manager, {
          repo_id: item.repo_id,
          old_struct_id: oldStructId
        })
        .catch(e =>
          helper.reThrow(e, enums.storeErrorsEnum.STORE_DELETE_OLD_STRUCT)
        );
    })
    .catch(e => helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_TRANSACTION));

  return {
    deleted_dev_files: filesItem.deleted_files,
    changed_dev_files: filesItem.changed_files,
    new_dev_files: filesItem.new_files,
    errors: itemStruct.errors,
    models: itemStruct.models,
    dashboards: itemStruct.dashboards,
    dev_repo: repo
  };
}
