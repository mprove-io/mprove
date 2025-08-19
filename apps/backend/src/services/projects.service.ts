import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';

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
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async getProjectCheckExists(item: { projectId: string }) {
    let { projectId } = item;

    let project = await this.db.drizzle.query.projectsTable.findFirst({
      where: eq(projectsTable.projectId, projectId)
    });

    if (isUndefined(project)) {
      throw new ServerError({
        message: ErEnum.BACKEND_PROJECT_DOES_NOT_EXIST
      });
    }

    return project;
  }

  async addProject(item: {
    orgId: string;
    name: string;
    user: UserEnt;
    traceId: string;
    testProjectId: string;
    projectId: string;
    remoteType: ProjectRemoteTypeEnum;
    gitUrl?: string;
    privateKey?: string;
    publicKey?: string;
    evs: Ev[];
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
      publicKey,
      evs
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
          routingKey: makeRoutingKeyToDisk({
            orgId: orgId,
            projectId: projectId
          }),
          message: toDiskCreateProjectRequest,
          checkIsOk: true
        }
      );

    let newProject: ProjectEnt = {
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

    let prodEnv = this.makerService.makeEnv({
      projectId: newProject.projectId,
      envId: PROJECT_ENV_PROD,
      evs: evs
    });

    let newMember = this.makerService.makeMember({
      projectId: newProject.projectId,
      user: user,
      isAdmin: true,
      isEditor: true,
      isExplorer: true
    });

    let devStructId = makeId();
    let prodStructId = makeId();

    let prodBranch = this.makerService.makeBranch({
      projectId: newProject.projectId,
      repoId: PROD_REPO_ID,
      branchId: newProject.defaultBranch
    });

    let devBranch = this.makerService.makeBranch({
      projectId: newProject.projectId,
      repoId: user.userId,
      branchId: newProject.defaultBranch
    });

    let prodBranchBridgeProdEnv = this.makerService.makeBridge({
      projectId: prodBranch.projectId,
      repoId: prodBranch.repoId,
      branchId: prodBranch.branchId,
      envId: prodEnv.envId,
      structId: prodStructId,
      needValidate: false
    });

    let devBranchBridgeProdEnv = this.makerService.makeBridge({
      projectId: devBranch.projectId,
      repoId: devBranch.repoId,
      branchId: devBranch.branchId,
      envId: prodEnv.envId,
      structId: devStructId,
      needValidate: false
    });

    await this.blockmlService.rebuildStruct({
      traceId,
      projectId: newProject.projectId,
      structId: prodStructId,
      diskFiles: diskResponse.payload.prodFiles,
      mproveDir: diskResponse.payload.mproveDir,
      envId: PROJECT_ENV_PROD,
      overrideTimezone: undefined,
      evs: evs
    });

    await this.blockmlService.rebuildStruct({
      traceId,
      projectId: newProject.projectId,
      structId: devStructId,
      diskFiles: diskResponse.payload.prodFiles,
      mproveDir: diskResponse.payload.mproveDir,
      envId: PROJECT_ENV_PROD,
      overrideTimezone: undefined,
      evs: evs
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

    return newProject;
  }
}
