import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { projectsTable } from '~backend/drizzle/postgres/schema/projects';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { BlockmlService } from './blockml.service';
import { HashService } from './hash.service';
import { MakerService } from './maker.service';
import { RabbitService } from './rabbit.service';

let retry = require('async-retry');

@Injectable()
export class ProjectsService {
  constructor(
    private rabbitService: RabbitService,
    private blockmlService: BlockmlService,
    private hashService: HashService,
    private makerService: MakerService,
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async getProjectCheckExists(item: { projectId: string }) {
    let { projectId } = item;

    let project = await this.db.drizzle.query.projectsTable.findFirst({
      where: eq(projectsTable.projectId, projectId)
    });

    // let project = await this.projectsRepository.findOne({
    //   where: {
    //     project_id: projectId
    //   }
    // });

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
    user: schemaPostgres.UserEnt;
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
        devRepoId: user.userId,
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

    let newProject: schemaPostgres.ProjectEnt = {
      orgId: orgId,
      projectId: projectId,
      name: name,
      defaultBranch: diskResponse.payload.defaultBranch,
      remoteType: remoteType,
      gitUrl: gitUrl,
      privateKey: privateKey,
      publicKey: publicKey,
      serverTs: undefined
    };

    // let newProject = maker.makeProject({
    //   orgId: orgId,
    //   name: name,
    //   projectId: projectId,
    //   defaultBranch: diskResponse.payload.defaultBranch,
    //   remoteType: remoteType,
    //   gitUrl: gitUrl,
    //   publicKey: publicKey,
    //   privateKey: privateKey
    // });

    let prodEnv = this.makerService.makeEnv({
      projectId: newProject.projectId,
      envId: common.PROJECT_ENV_PROD
    });

    // let prodEnv = maker.makeEnv({
    //   projectId: newProject.project_id,
    //   envId: common.PROJECT_ENV_PROD
    // });

    let newMember = this.makerService.makeMember({
      projectId: newProject.projectId,
      user: user,
      isAdmin: true,
      isEditor: true,
      isExplorer: true
    });

    // let newMember = maker.makeMember({
    //   projectId: newProject.project_id,
    //   user: user,
    //   isAdmin: common.BoolEnum.TRUE,
    //   isEditor: common.BoolEnum.TRUE,
    //   isExplorer: common.BoolEnum.TRUE
    // });

    let devStructId = common.makeId();
    let prodStructId = common.makeId();

    let prodBranch = this.makerService.makeBranch({
      projectId: newProject.projectId,
      repoId: common.PROD_REPO_ID,
      branchId: newProject.defaultBranch
    });

    // let prodBranch = maker.makeBranch({
    //   projectId: newProject.project_id,
    //   repoId: common.PROD_REPO_ID,
    //   branchId: newProject.default_branch
    // });

    let devBranch = this.makerService.makeBranch({
      projectId: newProject.projectId,
      repoId: user.userId,
      branchId: newProject.defaultBranch
    });

    // let devBranch = maker.makeBranch({
    //   projectId: newProject.project_id,
    //   repoId: user.user_id,
    //   branchId: newProject.default_branch
    // });

    let prodBranchBridgeProdEnv = this.makerService.makeBridge({
      projectId: prodBranch.projectId,
      repoId: prodBranch.repoId,
      branchId: prodBranch.branchId,
      envId: prodEnv.envId,
      structId: prodStructId,
      needValidate: false
    });

    // let prodBranchBridgeProdEnv = maker.makeBridge({
    //   projectId: prodBranch.project_id,
    //   repoId: prodBranch.repo_id,
    //   branchId: prodBranch.branch_id,
    //   envId: prodEnv.env_id,
    //   structId: prodStructId,
    //   needValidate: common.BoolEnum.FALSE
    // });

    let devBranchBridgeProdEnv = this.makerService.makeBridge({
      projectId: devBranch.projectId,
      repoId: devBranch.repoId,
      branchId: devBranch.branchId,
      envId: prodEnv.envId,
      structId: devStructId,
      needValidate: false
    });

    // let devBranchBridgeProdEnv = maker.makeBridge({
    //   projectId: devBranch.project_id,
    //   repoId: devBranch.repo_id,
    //   branchId: devBranch.branch_id,
    //   envId: prodEnv.env_id,
    //   structId: devStructId,
    //   needValidate: common.BoolEnum.FALSE
    // });

    await this.blockmlService.rebuildStruct({
      traceId,
      orgId: newProject.orgId,
      projectId: newProject.projectId,
      structId: prodStructId,
      diskFiles: diskResponse.payload.prodFiles,
      mproveDir: diskResponse.payload.mproveDir,
      envId: common.PROJECT_ENV_PROD
    });

    await this.blockmlService.rebuildStruct({
      traceId,
      orgId: newProject.orgId,
      projectId: newProject.projectId,
      structId: devStructId,
      diskFiles: diskResponse.payload.prodFiles,
      mproveDir: diskResponse.payload.mproveDir,
      envId: common.PROJECT_ENV_PROD
    });

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insert: {
                projects: [newProject],
                envs: [prodEnv],
                members: [newMember],
                branches: [prodBranch, devBranch],
                bridges: [prodBranchBridgeProdEnv, devBranchBridgeProdEnv]
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    // let records = await this.dbService.writeRecords({
    //   modify: false,
    //   records: {
    //     projects: [newProject],
    //     envs: [prodEnv],
    //     members: [newMember],
    //     branches: [prodBranch, devBranch],
    //     bridges: [prodBranchBridgeProdEnv, devBranchBridgeProdEnv]
    //   }
    // });

    return newProject;
    // return records.projects[0];
  }
}
