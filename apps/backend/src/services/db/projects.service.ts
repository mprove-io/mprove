import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import { BackendConfig } from '~backend/config/backend-config';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import {
  ProjectEnt,
  projectsTable
} from '~backend/drizzle/postgres/schema/projects';
import { UserEnt } from '~backend/drizzle/postgres/schema/users';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { makeRoutingKeyToDisk } from '~backend/functions/make-routing-key-to-disk';
import { PROD_REPO_ID, PROJECT_ENV_PROD } from '~common/constants/top';
import { ErEnum } from '~common/enums/er.enum';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';
import { ToDiskRequestInfoNameEnum } from '~common/enums/to/to-disk-request-info-name.enum';
import { isUndefined } from '~common/functions/is-undefined';
import { makeId } from '~common/functions/make-id';
import { Ev } from '~common/interfaces/backend/ev';
import { Project } from '~common/interfaces/backend/project';
import { ProjectConnection } from '~common/interfaces/backend/project-connection';
import {
  ToDiskCreateProjectRequest,
  ToDiskCreateProjectResponse
} from '~common/interfaces/to-disk/02-projects/to-disk-create-project';
import { ServerError } from '~common/models/server-error';
import { BlockmlService } from './blockml.service';
import { HashService } from './hash.service';
import { EntMakerService } from './maker.service';
import { RabbitService } from './rabbit.service';
import { TabService } from './tab.service';
import { WrapEnxToApiService } from './wrap-to-api.service';

let retry = require('async-retry');

@Injectable()
export class ProjectsService {
  constructor(
    private tabService: TabService,
    private wrapToApiService: WrapEnxToApiService,
    private rabbitService: RabbitService,
    private blockmlService: BlockmlService,
    private hashService: HashService,
    private entMakerService: EntMakerService,
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
    connections: ProjectConnection[];
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
      evs,
      connections
    } = item;

    let apiProject: Project = {
      orgId: orgId,
      projectId: projectId,
      name: name,
      remoteType: remoteType,
      defaultBranch: undefined, // set based on remoteType in Disk service
      gitUrl: gitUrl,
      tab: {
        privateKey: privateKey,
        publicKey: publicKey
      },
      serverTs: undefined
    };

    let toDiskCreateProjectRequest: ToDiskCreateProjectRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskCreateProject,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        baseProject: apiProject,
        devRepoId: user.userId,
        userAlias: user.alias,
        testProjectId: testProjectId
      }
    };

    let diskResponse =
      await this.rabbitService.sendToDisk<ToDiskCreateProjectResponse>({
        routingKey: makeRoutingKeyToDisk({
          orgId: orgId,
          projectId: projectId
        }),
        message: toDiskCreateProjectRequest,
        checkIsOk: true
      });

    let newProject: ProjectEnt = {
      orgId: orgId,
      projectId: projectId,
      name: name,
      defaultBranch: diskResponse.payload.defaultBranch,
      remoteType: remoteType,
      gitUrl: gitUrl,
      tab: this.tabService.encrypt({ data: apiProject.tab }),
      serverTs: undefined
    };

    let prodEnv = this.entMakerService.makeEnv({
      projectId: newProject.projectId,
      envId: PROJECT_ENV_PROD,
      evs: evs
    });

    let newMember = this.entMakerService.makeMember({
      projectId: newProject.projectId,
      user: user,
      isAdmin: true,
      isEditor: true,
      isExplorer: true
    });

    let devStructId = makeId();
    let prodStructId = makeId();

    let prodBranch = this.entMakerService.makeBranch({
      projectId: newProject.projectId,
      repoId: PROD_REPO_ID,
      branchId: newProject.defaultBranch
    });

    let devBranch = this.entMakerService.makeBranch({
      projectId: newProject.projectId,
      repoId: user.userId,
      branchId: newProject.defaultBranch
    });

    let prodBranchBridgeProdEnv = this.entMakerService.makeBridge({
      projectId: prodBranch.projectId,
      repoId: prodBranch.repoId,
      branchId: prodBranch.branchId,
      envId: prodEnv.envId,
      structId: prodStructId,
      needValidate: false
    });

    let devBranchBridgeProdEnv = this.entMakerService.makeBridge({
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
      evs: evs,
      connections: connections
    });

    await this.blockmlService.rebuildStruct({
      traceId,
      projectId: newProject.projectId,
      structId: devStructId,
      diskFiles: diskResponse.payload.prodFiles,
      mproveDir: diskResponse.payload.mproveDir,
      envId: PROJECT_ENV_PROD,
      overrideTimezone: undefined,
      evs: evs,
      connections: connections
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
