import { Request, Response } from 'express';
import { api } from '../../../barrels/api';
import { enums } from '../../../barrels/enums';
import { helper } from '../../../barrels/helper';
import { handler } from '../../../barrels/handler';
import { constants } from '../../../barrels/constants';
import { sender } from '../../../barrels/sender';
import { interfaces } from '../../../barrels/interfaces';
import { copier } from '../../../barrels/copier';
import { blockml } from '../../../barrels/blockml';
import { store } from '../../../barrels/store';
import { disk } from '../../../barrels/disk';
import { validator } from '../../../barrels/validator';
import { In, getConnection } from 'typeorm';
import { forEach } from 'p-iteration';
import { entities } from '../../../barrels/entities';
import * as crypto from 'crypto';
import { proc } from '../../../barrels/proc';
import { generator } from '../../../barrels/generator';
import { ServerError } from '../../../models/server-error';
import { git } from '../../../barrels/git';
import { config } from '../../../barrels/config';
import { credentials } from '../../../barrels/credentials';

export async function cypressSeed(req: Request, res: Response) {
  let payload: api.CypressSeedRequestBody['payload'] = validator.getPayload(
    req
  );

  let users: entities.UserEntity[] = [];
  let projects: entities.ProjectEntity[] = [];
  let members: entities.MemberEntity[] = [];

  let repos: entities.RepoEntity[] = [];
  let files: entities.FileEntity[] = [];

  let dashboards: entities.DashboardEntity[] = [];
  let errors: entities.ErrorEntity[] = [];
  let mconfigs: entities.MconfigEntity[] = [];
  let models: entities.ModelEntity[] = [];
  let queries: entities.QueryEntity[] = [];

  if (payload.users) {
    await forEach(payload.users, async x => {
      let salt = x.password
        ? crypto.randomBytes(16).toString('hex')
        : undefined;

      let hash = x.password
        ? crypto
            .pbkdf2Sync(x.password, salt, 1000, 64, 'sha512')
            .toString('hex')
        : undefined;

      let alias = <string>(
        await proc
          .findAlias(x.user_id)
          .catch(e => helper.reThrow(e, enums.procErrorsEnum.PROC_FIND_ALIAS))
      );

      let newUser = generator.makeUser({
        user_id: x.user_id,
        email_verified: helper.booleanToBenum(x.email_verified),
        email_verification_token: x.email_verification_token,
        password_reset_token: x.password_reset_token,
        password_reset_expires_ts: x.password_reset_token
          ? helper.makeTsOffset(86400000)
          : undefined,
        salt: salt,
        hash: hash,
        alias: alias
      });

      users.push(newUser);
    });
  }

  if (payload.projects) {
    await forEach(payload.projects, async x => {
      let projectId = x.project_id;

      let projectDir = `${config.DISK_BASE_PATH}/${projectId}`;

      await disk
        .ensureDir(projectDir)
        .catch(e => helper.reThrow(e, enums.diskErrorsEnum.DISK_ENSURE_DIR));

      let project: entities.ProjectEntity = generator.makeProject({
        project_id: projectId
      });

      if (x.has_credentials === true) {
        let credentialsString: string = JSON.stringify(
          credentials.bigqueryMproveDemo
        );

        let fileAbsoluteId = `${
          config.DISK_BIGQUERY_CREDENTIALS_PATH
        }/${projectId}.json`;

        await disk
          .writeToFile({
            file_absolute_id: fileAbsoluteId,
            content: credentialsString
          })
          .catch(e =>
            helper.reThrow(e, enums.diskErrorsEnum.DISK_WRITE_TO_FILE)
          );

        let credentialsParsed = JSON.parse(credentialsString);

        await proc
          .createDataset({
            bigquery_project: credentialsParsed.project_id,
            project_id: projectId,
            credentials_file_path: fileAbsoluteId
          })
          .catch(e =>
            helper.reThrow(e, enums.procErrorsEnum.PROC_CREATE_DATASET)
          );

        project.has_credentials = enums.bEnum.TRUE;
        project.bigquery_credentials = credentialsString;
        project.bigquery_credentials_file_path = fileAbsoluteId;
        project.bigquery_project = credentialsParsed.project_id;
        project.bigquery_client_email = credentialsParsed.client_email;
      }

      projects.push(project);

      let projectMembers: entities.MemberEntity[] = payload.members
        .filter(m => m.project_id === projectId)
        .map(member =>
          generator.makeMember({
            user: users.find(user => user.user_id === member.member_id),
            project_id: projectId,
            is_admin: helper.booleanToBenum(member.is_admin),
            is_editor: helper.booleanToBenum(member.is_editor)
          })
        );

      members = helper.makeNewArray(members, projectMembers);

      await git
        .prepareCentralAndProd({ project_id: projectId, use_data: true })
        .catch(e =>
          helper.reThrow(e, enums.gitErrorsEnum.GIT_PREPARE_CENTRAL_AND_PROD)
        );

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
      queries = helper.makeNewArray(queries, prodQueries);

      // dev repos

      let memberIds = projectMembers.map(member => member.member_id);

      await forEach(memberIds, async (repoId: string) => {
        let repoDir = `${config.DISK_BASE_PATH}/${projectId}/${repoId}`;

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
          dashboards: prodDashboards,
          mconfigs: prodMconfigs,
          errors: prodErrors
        });

        let {
          dashboards: repoDashboards,
          models: repoModels,
          errors: repoErrors,
          mconfigs: repoMconfigs
        } = structCopyItem;

        dashboards = helper.makeNewArray(dashboards, repoDashboards);
        errors = helper.makeNewArray(errors, repoErrors);
        mconfigs = helper.makeNewArray(mconfigs, repoMconfigs);
        models = helper.makeNewArray(models, repoModels);
      });
    });
  }

  // update server_ts

  let newServerTs = helper.makeTs();

  users = helper.refreshServerTs(users, newServerTs);
  projects = helper.refreshServerTs(projects, newServerTs);
  repos = helper.refreshServerTs(repos, newServerTs);
  files = helper.refreshServerTs(files, newServerTs);
  queries = helper.refreshServerTs(queries, newServerTs);
  models = helper.refreshServerTs(models, newServerTs);
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
            users: users,
            projects: projects,
            repos: repos,
            files: files,
            queries: queries,
            models: models,
            mconfigs: mconfigs,
            dashboards: dashboards,
            errors: errors,
            members: members
          },
          skip_chunk: true,
          server_ts: newServerTs,
          source_init_id: undefined
        })
        .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_INSERT));
    })
    .catch(e => helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_TRANSACTION));

  // response

  let responsePayload: api.CypressSeedResponse200Body['payload'] = {
    empty: true
  };

  res.json({ payload: payload });
}
