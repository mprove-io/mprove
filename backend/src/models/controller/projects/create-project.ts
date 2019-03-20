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
import { ServerError } from '../../server-error';

export async function createProject(req: Request, res: Response) {
  let initId = validator.getRequestInfoInitId(req);

  let userId: string = req.user.email;

  let projectId: api.CreateProjectRequestBody['payload']['project_id'] = validator.getPayloadProjectId(
    req
  );

  projectId = projectId.toLowerCase();

  let projectDir = `${config.DISK_BACKEND_PROJECTS_PATH}/${projectId}`;

  await disk
    .emptyDir(projectDir)
    .catch(e => helper.reThrow(e, enums.diskErrorsEnum.DISK_EMPTY_DIR));

  await git
    .prepareCentralAndProd({ project_id: projectId, use_data: false })
    .catch(e =>
      helper.reThrow(e, enums.gitErrorsEnum.GIT_PREPARE_CENTRAL_AND_PROD)
    );

  let newProject: entities.ProjectEntity = generator.makeProject({
    project_id: projectId
  });

  let structId = helper.makeId();

  // prod

  let itemProdCatalog = <interfaces.ItemCatalog>await disk
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

  let prodRepo: entities.RepoEntity = generator.makeRepo({
    project_id: projectId,
    repo_id: constants.PROD_REPO_ID,
    nodes: itemProdCatalog.nodes,
    struct_id: structId
  });

  // dev

  await git
    .cloneCentralToDev({
      project_id: projectId,
      dev_repo_id: userId
    })
    .catch(e =>
      helper.reThrow(e, enums.gitErrorsEnum.GIT_CLONE_CENTRAL_TO_DEV)
    );

  let itemDevCatalog = <interfaces.ItemCatalog>await disk
    .getRepoCatalogNodesAndFiles({
      project_id: projectId,
      repo_id: userId
    })
    .catch(e =>
      helper.reThrow(
        e,
        enums.diskErrorsEnum.DISK_GET_REPO_CATALOG_NODES_AND_FILES
      )
    );

  let devRepo: entities.RepoEntity = generator.makeRepo({
    project_id: projectId,
    repo_id: userId,
    nodes: itemDevCatalog.nodes,
    struct_id: structId
  });

  // no need to rebuild because no credentials

  let storeUsers = store.getUsersRepo();

  let user = <entities.UserEntity>(
    await storeUsers
      .findOne(userId)
      .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_USERS_FIND_ONE))
  );

  if (!user) {
    throw new ServerError({ name: enums.otherErrorsEnum.USER_NOT_FOUND });
  }

  let newMember = generator.makeMember({
    user: user,
    project_id: projectId,
    is_admin: enums.bEnum.TRUE,
    is_editor: enums.bEnum.TRUE
  });

  // update server_ts

  let newServerTs = helper.makeTs();

  newProject.server_ts = newServerTs;
  devRepo.server_ts = newServerTs;
  prodRepo.server_ts = newServerTs;
  itemDevCatalog.files = helper.refreshServerTs(
    itemDevCatalog.files,
    newServerTs
  );
  itemProdCatalog.files = helper.refreshServerTs(
    itemProdCatalog.files,
    newServerTs
  );
  newMember.server_ts = newServerTs;

  // save to database

  let connection = getConnection();

  await connection
    .transaction(async manager => {
      await store
        .insert({
          manager: manager,
          records: {
            projects: [newProject],
            repos: [devRepo, prodRepo],
            files: helper.makeNewArray(
              itemDevCatalog.files,
              itemProdCatalog.files
            ),
            members: [newMember]
          },
          server_ts: newServerTs,
          source_init_id: initId
        })
        .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_INSERT));
    })
    .catch(e => helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_TRANSACTION));

  // response

  let payload: api.CreateProjectResponse200Body['payload'] = {
    project: wrapper.wrapToApiProject(newProject),
    member: wrapper.wrapToApiMember(newMember),
    dev_files: itemDevCatalog.files.map(file => wrapper.wrapToApiFile(file)),
    prod_files: itemProdCatalog.files.map(file => wrapper.wrapToApiFile(file)),
    dev_struct: {
      errors: [],
      models: [],
      dashboards: [],
      repo: wrapper.wrapToApiRepo(devRepo)
    },
    prod_struct: {
      errors: [],
      models: [],
      dashboards: [],
      repo: wrapper.wrapToApiRepo(prodRepo)
    }
  };

  sender.sendClientResponse(req, res, payload);
}
