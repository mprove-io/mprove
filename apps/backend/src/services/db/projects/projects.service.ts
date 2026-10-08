import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  BranchTab,
  BridgeTab,
  ConnectionTab,
  EnvTab,
  MemberTab,
  ProjectTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import {
  type ProjectEnt,
  projectsTable
} from '#backend/drizzle/postgres/schema/projects';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import {
  BlockmlService,
  type RebuildStructResultValue
} from '#backend/services/blockml/blockml.service';
import { BranchesService } from '#backend/services/db/branches/branches.service';
import { BridgesService } from '#backend/services/db/bridges/bridges.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { HashService } from '#backend/services/hash/hash.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { PROD_REPO_ID, PROJECT_ENV_PROD } from '#common/constants/top';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty/is-defined-and-not-empty';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { makeId } from '#common/functions/make-id/make-id';
import type { AddProjectResultError } from '#common/types/backend/function-errors/add-project-result-error';
import type { DbErrorToResultError } from '#common/types/backend/function-errors/db-error-to-result-error';
import type { GetProjectCheckExistsResultError } from '#common/types/backend/function-errors/get-project-check-exists-result-error';
import type { RebuildStructResultError } from '#common/types/backend/function-errors/rebuild-struct-result-error';
import type { SendToDiskResultError } from '#common/types/backend/function-errors/send-to-disk-result-error';
import type { Ev } from '#common/types/backend/parts/ev';
import type { BaseProject } from '#common/types/backend/parts/project/base-project';
import type { Project } from '#common/types/backend/parts/project/project';
import type { ProjectRemoteType } from '#common/types/backend/parts/project/project-remote-type';
import type { ProjectsItem } from '#common/types/backend/parts/projects-item';
import type { ToDiskCreateProjectOutput } from '#common/types/disk/routes/projects/create-project/create-project-output';

@Injectable()
export class ProjectsService {
  constructor(
    private tabService: TabService,
    private hashService: HashService,
    private rpcService: RpcService,
    private blockmlService: BlockmlService,
    private envsService: EnvsService,
    private membersService: MembersService,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  wrapToApiProjectsItem(item: { project: ProjectTab }): ProjectsItem {
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
      isE2bApiKeySet: isDefinedAndNotEmpty(project.e2bApiKey),
      serverTs: Number(project.serverTs)
    };

    return apiProject;
  }

  async getProjectCheckExists(item: {
    projectId: string;
  }): Promise<ProjectTab> {
    let result: Result.Result<ProjectTab, GetProjectCheckExistsResultError> =
      await this.getProjectCheckExistsResult(item);

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let project: ProjectTab = result.value;

    return project;
  }

  async getProjectCheckExistsResult(item: {
    projectId: string;
  }): Result.ResultAsync<ProjectTab, GetProjectCheckExistsResultError> {
    let { projectId } = item;

    let projectEnt: ProjectEnt =
      await this.db.drizzle.query.projectsTable.findFirst({
        where: eq(projectsTable.projectId, projectId)
      });

    if (isUndefined(projectEnt)) {
      return Result.fail({
        code: 'BACKEND_PROJECT_DOES_NOT_EXIST'
      });
    }

    return this.tabService.projectEntToTabResult({ projectEnt: projectEnt });
  }

  async checkProjectIsNotRestricted(item: {
    projectId: string;
    userMember: MemberTab;
    repoId: string;
  }) {
    let { projectId, userMember, repoId } = item;

    let demoProjectId =
      this.cs.get<BackendConfig['demoProjectId']>('demoProjectId');

    if (
      userMember.isAdmin === false &&
      projectId === demoProjectId &&
      (isUndefined(repoId) || repoId === PROD_REPO_ID)
    ) {
      throw new ServerError({
        message: 'BACKEND_RESTRICTED_PROJECT'
      });
    }
  }

  async addProject(item: {
    projectId: string;
    orgId: string;
    remoteType: ProjectRemoteType;
    name: string;
    gitUrl?: string;
    publicKey?: string;
    privateKey?: string;
    publicKeyEncrypted?: string;
    privateKeyEncrypted?: string;
    passPhrase?: string;
    e2bApiKey?: string;
    seedProjectId: string;
    user: UserTab;
    evs: Ev[];
    connections: ConnectionTab[];
    traceId: string;
  }): Promise<ProjectTab> {
    let result: Result.Result<ProjectTab, AddProjectResultError> =
      await this.addProjectResult(item);

    if (Result.isFailure(result)) {
      throw new ServerError({
        message: result.error.code,
        displayData:
          result.error.code === 'BACKEND_INVALID_REQUEST'
            ? result.error.displayData
            : undefined,
        originalError:
          (result.error.code === 'BACKEND_ERROR_RESPONSE_FROM_DISK' ||
            result.error.code === 'BACKEND_ERROR_RESPONSE_FROM_BLOCKML') &&
          result.error.originalError
            ? Object.assign(new Error(result.error.originalError.code), {
                displayData:
                  'displayData' in result.error.originalError
                    ? result.error.originalError.displayData
                    : undefined
              })
            : undefined
      });
    }

    let project: ProjectTab = result.value;

    return project;
  }

  async addProjectResult(item: {
    projectId: string;
    orgId: string;
    remoteType: ProjectRemoteType;
    name: string;
    gitUrl?: string;
    publicKey?: string;
    privateKey?: string;
    publicKeyEncrypted?: string;
    privateKeyEncrypted?: string;
    passPhrase?: string;
    e2bApiKey?: string;
    seedProjectId: string;
    user: UserTab;
    evs: Ev[];
    connections: ConnectionTab[];
    traceId: string;
  }): Result.ResultAsync<ProjectTab, AddProjectResultError> {
    let {
      projectId,
      orgId,
      remoteType,
      name,
      gitUrl,
      publicKey,
      privateKey,
      publicKeyEncrypted,
      privateKeyEncrypted,
      passPhrase,
      e2bApiKey,
      seedProjectId,
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
      publicKey: publicKey,
      privateKey: privateKey,
      publicKeyEncrypted: publicKeyEncrypted,
      privateKeyEncrypted: privateKeyEncrypted,
      passPhrase: passPhrase,
      e2bApiKey: e2bApiKey,
      nameHash: undefined, // tab-to-ent
      gitUrlHash: undefined, // tab-to-ent
      keyTag: undefined,
      serverTs: undefined
    };

    let baseProject: BaseProject = this.tabService.projectTabToBaseProject({
      project: newProject
    });

    let diskResult: Result.Result<
      ToDiskCreateProjectOutput,
      SendToDiskResultError
    > = await this.rpcService.sendToDiskResult({
      request: {
        operation: 'createProject',
        traceId: traceId,
        input: {
          baseProject: baseProject,
          devRepoId: user.userId,
          userAlias: user.alias,
          seedProjectId: seedProjectId
        }
      }
    });

    if (Result.isFailure(diskResult)) {
      return diskResult;
    }

    let diskCreateProjectOutput: ToDiskCreateProjectOutput = diskResult.value;

    newProject.defaultBranch = diskCreateProjectOutput.defaultBranch;

    let prodEnv: EnvTab = this.envsService.makeEnv({
      projectId: newProject.projectId,
      envId: PROJECT_ENV_PROD,
      evs: evs
    });

    let newMember: MemberTab = this.membersService.makeMember({
      projectId: newProject.projectId,
      user: user,
      isAdmin: true,
      isEditor: true,
      isExplorer: true
    });

    let devStructId: string = makeId();

    let prodStructId: string = makeId();

    let prodBranch: BranchTab = this.branchesService.makeBranch({
      projectId: newProject.projectId,
      repoId: PROD_REPO_ID,
      branchId: newProject.defaultBranch
    });

    let devBranch: BranchTab = this.branchesService.makeBranch({
      projectId: newProject.projectId,
      repoId: user.userId,
      branchId: newProject.defaultBranch
    });

    let prodBranchBridgeProdEnv: BridgeTab = this.bridgesService.makeBridge({
      projectId: prodBranch.projectId,
      repoId: prodBranch.repoId,
      branchId: prodBranch.branchId,
      envId: prodEnv.envId,
      structId: prodStructId,
      needValidate: false
    });

    let devBranchBridgeProdEnv: BridgeTab = this.bridgesService.makeBridge({
      projectId: devBranch.projectId,
      repoId: devBranch.repoId,
      branchId: devBranch.branchId,
      envId: prodEnv.envId,
      structId: devStructId,
      needValidate: false
    });

    let prodStructResult: Result.Result<
      RebuildStructResultValue,
      RebuildStructResultError
    > = await this.blockmlService.rebuildStructResult({
      traceId: traceId,
      orgId: newProject.orgId,
      projectId: newProject.projectId,
      repoId: PROD_REPO_ID,
      structId: prodStructId,
      diskFiles: diskCreateProjectOutput.prodFiles,
      mproveDir: diskCreateProjectOutput.mproveDir,
      envId: PROJECT_ENV_PROD,
      selectedGivens: [],
      overrideTimezone: undefined,
      evs: evs,
      connections: connections
    });

    if (Result.isFailure(prodStructResult)) {
      return prodStructResult;
    }

    let devStructResult: Result.Result<
      RebuildStructResultValue,
      RebuildStructResultError
    > = await this.blockmlService.rebuildStructResult({
      traceId: traceId,
      orgId: newProject.orgId,
      projectId: newProject.projectId,
      repoId: user.userId,
      structId: devStructId,
      diskFiles: diskCreateProjectOutput.prodFiles,
      mproveDir: diskCreateProjectOutput.mproveDir,
      envId: PROJECT_ENV_PROD,
      selectedGivens: [],
      overrideTimezone: undefined,
      evs: evs,
      connections: connections
    });

    if (Result.isFailure(devStructResult)) {
      return devStructResult;
    }

    let persistence: Result.Result<void, DbErrorToResultError> =
      await dbErrorToResult({
        action: async () => {
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
        }
      });

    if (Result.isFailure(persistence)) {
      return persistence;
    }

    return Result.succeed(newProject);
  }
}
