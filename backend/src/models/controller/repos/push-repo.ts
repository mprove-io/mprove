import { Request, Response } from 'express';
import { getConnection } from 'typeorm';
import { api } from '../../../barrels/api';
import { constants } from '../../../barrels/constants';
import { copier } from '../../../barrels/copier';
import { disk } from '../../../barrels/disk';
import { entities } from '../../../barrels/entities';
import { enums } from '../../../barrels/enums';
import { git } from '../../../barrels/git';
import { helper } from '../../../barrels/helper';
import { interfaces } from '../../../barrels/interfaces';
import { proc } from '../../../barrels/proc';
import { sender } from '../../../barrels/sender';
import { store } from '../../../barrels/store';
import { validator } from '../../../barrels/validator';
import { wrapper } from '../../../barrels/wrapper';
import { ServerError } from '../../server-error';

export async function pushRepo(req: Request, res: Response) {
  let initId = validator.getRequestInfoInitId(req);

  let userId: string = req.user.email;

  let payload: api.PushRepoRequestBody['payload'] = validator.getPayload(req);

  let projectId = payload.project_id;
  let repoId = payload.repo_id;
  let serverTs = payload.server_ts;

  let storeRepos = store.getReposRepo();

  let devRepo = <entities.RepoEntity>await storeRepos
    .findOne({
      project_id: projectId,
      repo_id: repoId
    })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_REPOS_FIND_ONE));

  let prodRepo = <entities.RepoEntity>await storeRepos
    .findOne({
      project_id: projectId,
      repo_id: constants.PROD_REPO_ID
    })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_REPOS_FIND_ONE));

  if (!devRepo) {
    throw new ServerError({ name: enums.otherErrorsEnum.REPO_NOT_FOUND });
  }
  if (!prodRepo) {
    throw new ServerError({ name: enums.otherErrorsEnum.REPO_NOT_FOUND });
  }

  let oldStructId = prodRepo.struct_id;

  helper.checkServerTs(devRepo, serverTs);

  // push dev to production (central)

  await git
    .pushToCentral({
      project_id: projectId,
      from_repo_id: repoId
    })
    .catch(e => helper.reThrow(e, enums.gitErrorsEnum.GIT_PUSH_TO_CENTRAL));

  let itemStatusDev = <interfaces.ItemStatus>await git
    .getRepoStatus({
      project_id: projectId,
      repo_id: repoId
    })
    .catch(e => helper.reThrow(e, enums.gitErrorsEnum.GIT_GET_REPO_STATUS));

  devRepo.status = itemStatusDev.status;
  devRepo.conflicts = JSON.stringify(itemStatusDev.conflicts); // not necessary
  // devRepo.nodes not changed
  // devRepo.struct_id not changed
  // devRepo.pdts_sorted not changed
  // devRepo.udfs_content not changed

  // pull production (central) to prod

  await git
    .fetchOrigin({
      project_id: projectId,
      repo_id: constants.PROD_REPO_ID
    })
    .catch(e => helper.reThrow(e, enums.gitErrorsEnum.GIT_FETCH_ORIGIN));

  await git
    .mergeBranchesOriginToLocal({
      project_id: projectId,
      repo_id: constants.PROD_REPO_ID,
      user_id: userId
    })
    .catch(e =>
      helper.reThrow(e, enums.gitErrorsEnum.GIT_MERGE_BRANCHES_ORIGIN_TO_LOCAL)
    );

  let itemStatusProd = <interfaces.ItemStatus>await git
    .getRepoStatus({
      project_id: projectId,
      repo_id: constants.PROD_REPO_ID
    })
    .catch(e => helper.reThrow(e, enums.gitErrorsEnum.GIT_GET_REPO_STATUS));

  let itemCatalogProd = <interfaces.ItemCatalog>await disk
    .getRepoCatalogNodesAndFiles({
      project_id: projectId,
      repo_id: constants.PROD_REPO_ID
    })
    .catch(e =>
      helper.reThrow(
        e,
        enums.diskErrorsEnum.DISK_GET_REPO_CATALOG_NODES_AND_FILES
      )
    );

  prodRepo.status = itemStatusProd.status;
  prodRepo.conflicts = JSON.stringify(itemStatusProd.conflicts); // not necessary
  prodRepo.nodes = JSON.stringify(itemCatalogProd.nodes);
  prodRepo.struct_id = devRepo.struct_id;
  prodRepo.pdts_sorted = devRepo.pdts_sorted;
  prodRepo.udfs_content = devRepo.udfs_content;

  // file diffs

  let itemFilesProd = <interfaces.ItemFiles>await proc
    .findDifferencesInFiles({
      project_id: projectId,
      repo_id: constants.PROD_REPO_ID,
      repo_disk_files: itemCatalogProd.files
    })
    .catch(e =>
      helper.reThrow(e, enums.procErrorsEnum.PROC_FIND_DIFFERENCES_IN_FILES)
    );

  // copy struct

  let itemStructCopy = <interfaces.ItemStructCopy>await copier
    .copyStructFromDatabase({
      project_id: projectId,
      from_repo_id: repoId,
      to_repo_id: constants.PROD_REPO_ID
    })
    .catch(e =>
      helper.reThrow(e, enums.copierErrorsEnum.COPIER_COPY_STRUCT_FROM_DATABASE)
    );

  // update server_ts

  let newServerTs = helper.makeTs();

  devRepo.server_ts = newServerTs;
  prodRepo.server_ts = newServerTs;

  itemFilesProd.changed_files = helper.refreshServerTs(
    itemFilesProd.changed_files,
    newServerTs
  );
  itemFilesProd.deleted_files = helper.refreshServerTs(
    itemFilesProd.deleted_files,
    newServerTs
  );
  itemFilesProd.new_files = helper.refreshServerTs(
    itemFilesProd.new_files,
    newServerTs
  );

  itemStructCopy.models = helper.refreshServerTs(
    itemStructCopy.models,
    newServerTs
  );
  itemStructCopy.views = helper.refreshServerTs(
    itemStructCopy.views,
    newServerTs
  );
  itemStructCopy.dashboards = helper.refreshServerTs(
    itemStructCopy.dashboards,
    newServerTs
  );
  itemStructCopy.mconfigs = helper.refreshServerTs(
    itemStructCopy.mconfigs,
    newServerTs
  );
  itemStructCopy.errors = helper.refreshServerTs(
    itemStructCopy.errors,
    newServerTs
  );

  // save to database

  let connection = getConnection();

  await connection
    .transaction(async manager => {
      await store
        .save({
          manager: manager,
          records: {
            repos: [devRepo, prodRepo],
            files: helper.makeNewArray(
              itemFilesProd.new_files,
              itemFilesProd.changed_files,
              itemFilesProd.deleted_files
            ),
            models: itemStructCopy.models,
            views: itemStructCopy.views,
            dashboards: itemStructCopy.dashboards,
            mconfigs: itemStructCopy.mconfigs,
            errors: itemStructCopy.errors
          },
          server_ts: newServerTs,
          source_init_id: initId
        })
        .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_SAVE));
    })
    .catch(e => helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_TRANSACTION));

  if (itemFilesProd.deleted_files.length > 0) {
    let deleteFileAbsoluteIds = itemFilesProd.deleted_files.map(
      file => file.file_absolute_id
    );

    let storeFiles = store.getFilesRepo();

    await storeFiles
      .delete(deleteFileAbsoluteIds)
      .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_FILES_DELETE));
  }

  await store
    .deleteOldStruct({
      repo_id: repoId,
      old_struct_id: oldStructId
    })
    .catch(e =>
      helper.reThrow(e, enums.storeErrorsEnum.STORE_DELETE_OLD_STRUCT)
    );

  // response

  let responsePayload: api.PushRepoResponse200Body['payload'] = {
    deleted_prod_files: itemFilesProd.deleted_files.map(file =>
      wrapper.wrapToApiFile(file)
    ),
    changed_prod_files: itemFilesProd.changed_files.map(file =>
      wrapper.wrapToApiFile(file)
    ),
    new_prod_files: itemFilesProd.new_files.map(file =>
      wrapper.wrapToApiFile(file)
    ),
    prod_struct: {
      errors: itemStructCopy.errors.map(error => wrapper.wrapToApiError(error)),
      models: itemStructCopy.models.map(model => wrapper.wrapToApiModel(model)),
      views: itemStructCopy.views.map(view => wrapper.wrapToApiView(view)),
      dashboards: itemStructCopy.dashboards.map(dashboard =>
        wrapper.wrapToApiDashboard(dashboard)
      ),
      repo: wrapper.wrapToApiRepo(prodRepo)
    },
    dev_repo: wrapper.wrapToApiRepo(devRepo)
  };

  sender.sendClientResponse(req, res, responsePayload);
}
