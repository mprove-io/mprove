import { Request, Response } from 'express';
import { getConnection } from 'typeorm';
import { api } from '../../../barrels/api';
import { config } from '../../../barrels/config';
import { constants } from '../../../barrels/constants';
import { disk } from '../../../barrels/disk';
import { entities } from '../../../barrels/entities';
import { enums } from '../../../barrels/enums';
import { generator } from '../../../barrels/generator';
import { git } from '../../../barrels/git';
import { helper } from '../../../barrels/helper';
import { interfaces } from '../../../barrels/interfaces';
import { sender } from '../../../barrels/sender';
import { store } from '../../../barrels/store';
import { validator } from '../../../barrels/validator';
import { wrapper } from '../../../barrels/wrapper';
import { MyRegex } from '../../my-regex';
import { ServerError } from '../../server-error';

export async function createFile(req: Request, res: Response) {
  let initId = validator.getRequestInfoInitId(req);

  let payload: api.CreateFileRequestBody['payload'] = validator.getPayload(req);

  let projectId = payload.project_id;
  let repoId = payload.repo_id;
  let parentNodeId = payload.node_id;
  let fileName = payload.name;

  let storeRepos = store.getReposRepo();

  let repo = <entities.RepoEntity>await storeRepos
    .findOne({
      project_id: projectId,
      repo_id: repoId
    })
    .catch((e: any) =>
      helper.reThrow(e, enums.storeErrorsEnum.STORE_REPOS_FIND_ONE)
    );

  if (!repo) {
    throw new ServerError({ name: enums.otherErrorsEnum.REPO_NOT_FOUND });
  }

  let content;

  let regPart = MyRegex.CAPTURE_FILE_NAME_BEFORE_EXT();
  let rPart = regPart.exec(fileName.toLowerCase());

  let part: any = rPart ? rPart[1] : undefined;

  let regExt = MyRegex.CAPTURE_EXT();
  let rExt = regExt.exec(fileName.toLowerCase());

  let ext: any = rExt ? rExt[1] : '';

  switch (ext) {
    case constants.EXT_MD:
      content = '';
      break;
    case constants.EXT_DASHBOARD:
      content = `dashboard: ${part}`;
      break;
    case constants.EXT_MODEL:
      content = `model: ${part}`;
      break;
    case constants.EXT_VIEW:
      content = `view: ${part}`;
      break;
    case constants.EXT_UDF:
      content = `udf: ${part}`;
      break;
    default:
      content = '';
  }

  let repoDir = `${config.DISK_BACKEND_PROJECTS_PATH}/${projectId}/${repoId}`;

  let parent = parentNodeId.substring(projectId.length + 1);

  parent = parent.length > 0 ? parent + '/' : parent;

  let fileAbsoluteId = repoDir + '/' + parent + fileName;

  await disk
    .writeToFile({
      file_absolute_id: fileAbsoluteId,
      content: content
    })
    .catch(e => helper.reThrow(e, enums.diskErrorsEnum.DISK_WRITE_TO_FILE));

  await git
    .addChangesToStage({
      project_id: projectId,
      repo_id: repoId
    })
    .catch(e =>
      helper.reThrow(e, enums.gitErrorsEnum.GIT_ADD_CHANGES_TO_STAGE)
    );

  let fileNodeId = parentNodeId + '/' + fileName;

  let path = JSON.stringify(fileNodeId.split('/'));

  let fileId = MyRegex.replaceSlashesWithUnderscores(
    fileNodeId.substring(projectId.length + 1)
  );

  let file = generator.makeFile({
    file_absolute_id: fileAbsoluteId,
    file_id: fileId,
    project_id: projectId,
    repo_id: repoId,
    path: path,
    name: fileName,
    content: content
  });

  let itemStatus = <interfaces.ItemStatus>await git
    .getRepoStatus({
      project_id: projectId,
      repo_id: repoId
    })
    .catch(e => helper.reThrow(e, enums.gitErrorsEnum.GIT_GET_REPO_STATUS));

  let itemCatalog = <interfaces.ItemCatalog>await disk
    .getRepoCatalogNodesAndFiles({
      project_id: projectId,
      repo_id: repoId
    })
    .catch(e =>
      helper.reThrow(
        e,
        enums.diskErrorsEnum.DISK_GET_REPO_CATALOG_NODES_AND_FILES
      )
    );

  repo.status = itemStatus.status;
  repo.conflicts = JSON.stringify(itemStatus.conflicts);
  repo.nodes = JSON.stringify(itemCatalog.nodes);
  // repo.struct_id not changed
  // repo.pdts_sorted not changed
  // repo.udfs_content not changed

  // update server_ts
  let newServerTs = helper.makeTs();

  repo.server_ts = newServerTs;
  file.server_ts = newServerTs;

  // save to database
  let connection = getConnection();

  await connection
    .transaction(async manager => {
      await store
        .save({
          manager: manager,
          records: {
            repos: [repo],
            files: [file]
          },
          server_ts: newServerTs,
          source_init_id: initId
        })
        .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_SAVE));
    })
    .catch(e => helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_TRANSACTION));

  // response

  let responsePayload: api.CreateFileResponse200Body['payload'] = {
    created_dev_file: wrapper.wrapToApiFile(file),
    dev_repo: wrapper.wrapToApiRepo(repo)
  };

  sender.sendClientResponse(req, res, responsePayload);
}
