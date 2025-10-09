import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import { BackendConfig } from '~backend/config/backend-config';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import {
  ProjectEnt,
  projectsTable
} from '~backend/drizzle/postgres/schema/projects';
import { ConnectionTab } from '~backend/drizzle/postgres/tabs/connection-tab';
import {
  ProjectLt,
  ProjectSt,
  ProjectTab
} from '~backend/drizzle/postgres/tabs/project-tab';
import { UserTab } from '~backend/drizzle/postgres/tabs/user-tab';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { makeRoutingKeyToDisk } from '~backend/functions/make-routing-key-to-disk';
import { PROD_REPO_ID, PROJECT_ENV_PROD } from '~common/constants/top';
import { ErEnum } from '~common/enums/er.enum';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';
import { ToDiskRequestInfoNameEnum } from '~common/enums/to/to-disk-request-info-name.enum';
import { isUndefined } from '~common/functions/is-undefined';
import { makeId } from '~common/functions/make-id';
import { BaseProject } from '~common/interfaces/backend/base-project';
import { Ev } from '~common/interfaces/backend/ev';
import { Project } from '~common/interfaces/backend/project';
import { ProjectsItem } from '~common/interfaces/backend/projects-item';
import {
  ToDiskCreateProjectRequest,
  ToDiskCreateProjectResponse
} from '~common/interfaces/to-disk/02-projects/to-disk-create-project';
import { ServerError } from '~common/models/server-error';
import { BlockmlService } from '../blockml.service';
import { HashService } from '../hash.service';
import { RabbitService } from '../rabbit.service';
import { TabService } from '../tab.service';
import { BranchesService } from './branches.service';
import { BridgesService } from './bridges.service';
import { EnvsService } from './envs.service';
import { MembersService } from './members.service';

let retry = require('async-retry');

@Injectable()
export class ProjectsService {
  constructor(
    private tabService: TabService,
    private hashService: HashService,
    private rabbitService: RabbitService,
    private blockmlService: BlockmlService,
    private envsService: EnvsService,
    private membersService: MembersService,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  entToTab(projectEnt: ProjectEnt): ProjectTab {
    if (isUndefined(projectEnt)) {
      return;
    }

    let project: ProjectTab = {
      ...projectEnt,
      ...this.tabService.decrypt<ProjectSt>({
        encryptedString: projectEnt.st
      }),
      ...this.tabService.decrypt<ProjectLt>({
        encryptedString: projectEnt.lt
      })
    };

    return project;
  }

  wrapToApiProjectsItem(item: {
    project: ProjectTab;
  }): ProjectsItem {
    let { project } = item;

    let apiProjectItem: ProjectsItem = {
      projectId: project.projectId,
      name: project.name,
      defaultBranch: project.defaultBranch
    };

    return apiProjectItem;
  }

  tabToApiProject(item: {
    project: ProjectTab;
    isAddPublicKey: boolean;
    isAddGitUrl: boolean;
  }): Project {
    let { project, isAddGitUrl, isAddPublicKey } = item;

    let apiProject: Project = {
      orgId: project.orgId,
      projectId: project.projectId,
      remoteType: project.remoteType,
      name: project.name,
      defaultBranch: project.defaultBranch,
      gitUrl: isAddGitUrl === true ? project.gitUrl : undefined,
      publicKey: isAddPublicKey === true ? project.publicKey : undefined,
      serverTs: Number(project.serverTs)
    };

    return apiProject;
  }

  tabToApiBaseProject(item: {
    project: ProjectTab;
  }): BaseProject {
    let { project } = item;

    let projectSt: ProjectSt = {
      name: project.name
    };

    let projectLt: ProjectLt = {
      defaultBranch: project.defaultBranch,
      gitUrl: project.gitUrl,
      privateKey: project.privateKey,
      publicKey: project.publicKey
    };

    let apiBaseProject: BaseProject = {
      orgId: project.orgId,
      projectId: project.projectId,
      remoteType: project.remoteType,
      st: this.tabService.encrypt({ data: projectSt }),
      lt: this.tabService.encrypt({ data: projectLt })
    };

    return apiBaseProject;
  }

  async getProjectCheckExists(item: { projectId: string }) {
    let { projectId } = item;

    let project = await this.db.drizzle.query.projectsTable
      .findFirst({
        where: eq(projectsTable.projectId, projectId)
      })
      .then(x => this.entToTab(x));

    if (isUndefined(project)) {
      throw new ServerError({
        message: ErEnum.BACKEND_PROJECT_DOES_NOT_EXIST
      });
    }

    return project;
  }

  async addProject(item: {
    projectId: string;
    orgId: string;
    remoteType: ProjectRemoteTypeEnum;
    name: string;
    gitUrl?: string;
    privateKey?: string;
    publicKey?: string;
    testProjectId: string;
    user: UserTab;
    evs: Ev[];
    connections: ConnectionTab[];
    traceId: string;
  }) {
    let {
      projectId,
      orgId,
      remoteType,
      name,
      gitUrl,
      privateKey,
      publicKey,
      testProjectId,
      user,
      evs,
      connections,
      traceId
    } = item;

    let newProject: ProjectTab = {
      orgId: orgId,
      projectId: projectId,
      name: name,
      remoteType: remoteType,
      defaultBranch: undefined, // set based on remoteType in Disk service
      gitUrl: gitUrl,
      privateKey: privateKey,
      publicKey: publicKey,
      nameHash: this.hashService.makeHash(name),
      gitUrlHash: this.hashService.makeHash(gitUrl),
      serverTs: undefined
    };

    let baseProject = this.tabToApiBaseProject({ project: newProject });

    let toDiskCreateProjectRequest: ToDiskCreateProjectRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskCreateProject,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        baseProject: baseProject,
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

    newProject.defaultBranch = diskResponse.payload.defaultBranch;

    let prodEnv = this.envsService.makeEnv({
      projectId: newProject.projectId,
      envId: PROJECT_ENV_PROD,
      evs: evs
    });

    let newMember = this.membersService.makeMember({
      projectId: newProject.projectId,
      user: user,
      isAdmin: true,
      isEditor: true,
      isExplorer: true
    });

    let devStructId = makeId();
    let prodStructId = makeId();

    let prodBranch = this.branchesService.makeBranch({
      projectId: newProject.projectId,
      repoId: PROD_REPO_ID,
      branchId: newProject.defaultBranch
    });

    let devBranch = this.branchesService.makeBranch({
      projectId: newProject.projectId,
      repoId: user.userId,
      branchId: newProject.defaultBranch
    });

    let prodBranchBridgeProdEnv = this.bridgesService.makeBridge({
      projectId: prodBranch.projectId,
      repoId: prodBranch.repoId,
      branchId: prodBranch.branchId,
      envId: prodEnv.envId,
      structId: prodStructId,
      needValidate: false
    });

    let devBranchBridgeProdEnv = this.bridgesService.makeBridge({
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
