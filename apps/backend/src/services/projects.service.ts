import { Injectable } from '@nestjs/common';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { maker } from '~backend/barrels/maker';
import { repositories } from '~backend/barrels/repositories';
import { BlockmlService } from './blockml.service';
import { DbService } from './db.service';
import { RabbitService } from './rabbit.service';

@Injectable()
export class ProjectsService {
  constructor(
    private projectsRepository: repositories.ProjectsRepository,
    private rabbitService: RabbitService,
    private blockmlService: BlockmlService,
    private dbService: DbService
  ) {}

  async getProjectCheckExists(item: { projectId: string }) {
    let { projectId } = item;

    let project = await this.projectsRepository.findOne({
      where: {
        project_id: projectId
      }
    });

    if (common.isUndefined(project)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_PROJECT_DOES_NOT_EXIST
      });
    }

    return project;
  }

  async addProject(item: {
    orgId: string;
    name: string;
    user: entities.UserEntity;
    traceId: string;
    testProjectId: string;
    projectId: string;
    remoteType: common.ProjectRemoteTypeEnum;
    gitUrl?: string;
    privateKey?: string;
    publicKey?: string;
  }) {
    let {
      orgId,
      name,
      user,
      traceId,
      projectId,
      testProjectId,
      remoteType,
      gitUrl,
      privateKey,
      publicKey
    } = item;

    let toDiskCreateProjectRequest: apiToDisk.ToDiskCreateProjectRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateProject,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        projectId: projectId,
        projectName: name,
        devRepoId: user.user_id,
        userAlias: user.alias,
        testProjectId: testProjectId,
        remoteType: remoteType,
        gitUrl: gitUrl,
        privateKey: privateKey,
        publicKey: publicKey
      }
    };

    let diskResponse =
      await this.rabbitService.sendToDisk<apiToDisk.ToDiskCreateProjectResponse>(
        {
          routingKey: helper.makeRoutingKeyToDisk({
            orgId: orgId,
            projectId: projectId
          }),
          message: toDiskCreateProjectRequest,
          checkIsOk: true
        }
      );

    let newProject = maker.makeProject({
      orgId: orgId,
      name: name,
      projectId: projectId,
      defaultBranch: diskResponse.payload.defaultBranch,
      remoteType: remoteType,
      gitUrl: gitUrl,
      publicKey: publicKey,
      privateKey: privateKey
    });

    let prodEnv = maker.makeEnv({
      projectId: newProject.project_id,
      envId: common.PROJECT_ENV_PROD
    });

    let newMember = maker.makeMember({
      projectId: newProject.project_id,
      user: user,
      isAdmin: common.BoolEnum.TRUE,
      isEditor: common.BoolEnum.TRUE,
      isExplorer: common.BoolEnum.TRUE
    });

    let devStructId = common.makeId();
    let prodStructId = common.makeId();

    let prodBranch = maker.makeBranch({
      projectId: newProject.project_id,
      repoId: common.PROD_REPO_ID,
      branchId: newProject.default_branch
    });

    let devBranch = maker.makeBranch({
      projectId: newProject.project_id,
      repoId: user.user_id,
      branchId: newProject.default_branch
    });

    let prodBranchBridgeProdEnv = maker.makeBridge({
      projectId: prodBranch.project_id,
      repoId: prodBranch.repo_id,
      branchId: prodBranch.branch_id,
      envId: prodEnv.env_id,
      structId: prodStructId,
      needValidate: common.BoolEnum.FALSE
    });

    let devBranchBridgeProdEnv = maker.makeBridge({
      projectId: devBranch.project_id,
      repoId: devBranch.repo_id,
      branchId: devBranch.branch_id,
      envId: prodEnv.env_id,
      structId: devStructId,
      needValidate: common.BoolEnum.FALSE
    });

    await this.blockmlService.rebuildStruct({
      traceId,
      orgId: newProject.org_id,
      projectId: newProject.project_id,
      structId: prodStructId,
      diskFiles: diskResponse.payload.prodFiles,
      mproveDir: diskResponse.payload.mproveDir,
      envId: common.PROJECT_ENV_PROD
    });

    await this.blockmlService.rebuildStruct({
      traceId,
      orgId: newProject.org_id,
      projectId: newProject.project_id,
      structId: devStructId,
      diskFiles: diskResponse.payload.prodFiles,
      mproveDir: diskResponse.payload.mproveDir,
      envId: common.PROJECT_ENV_PROD
    });

    let records = await this.dbService.writeRecords({
      modify: false,
      records: {
        projects: [newProject],
        envs: [prodEnv],
        members: [newMember],
        branches: [prodBranch, devBranch],
        bridges: [prodBranchBridgeProdEnv, devBranchBridgeProdEnv]
      }
    });

    return records.projects[0];
  }
}
