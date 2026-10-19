import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BackendConfig } from '#backend/config/backend-config';
import type { PackerOutput } from '#backend/drizzle/postgres/drizzle-packer';
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
  BlockmlService,
  type RebuildStructOutput
} from '#backend/services/blockml/blockml.service';
import { BranchesService } from '#backend/services/db/branches/branches.service';
import { BridgesService } from '#backend/services/db/bridges/bridges.service';
import { DbService } from '#backend/services/db/db.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { PROD_REPO_ID, PROJECT_ENV_PROD } from '#common/constants/top';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty/is-defined-and-not-empty';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { makeId } from '#common/functions/make-id/make-id';
import type { AddProjectError } from '#common/types/backend/function-errors/add-project-error';
import type { CheckProjectIsNotRestrictedError } from '#common/types/backend/function-errors/check-project-is-not-restricted-error';
import type { RebuildStructError } from '#common/types/backend/function-errors/rebuild-struct-error';
import type { SendToDiskError } from '#common/types/backend/function-errors/send-to-disk-error';
import type { WriteError } from '#common/types/backend/function-errors/write-error';
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
    private rpcService: RpcService,
    private blockmlService: BlockmlService,
    private envsService: EnvsService,
    private membersService: MembersService,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private cs: ConfigService<BackendConfig>,
    private db: DbService
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

  checkProjectIsNotRestricted(item: {
    projectId: string;
    userMember: MemberTab;
    repoId?: string;
  }): Result.Result<void, CheckProjectIsNotRestrictedError> {
    let { projectId, userMember, repoId } = item;

    let demoProjectId: string =
      this.cs.get<BackendConfig['demoProjectId']>('demoProjectId');

    if (
      userMember.isAdmin === false &&
      projectId === demoProjectId &&
      (isUndefined(repoId) || repoId === PROD_REPO_ID)
    ) {
      return Result.fail({
        code: 'BACKEND_RESTRICTED_PROJECT'
      });
    }

    return Result.succeed();
  }

  async addProjectUnwrap(item: {
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
    let result: Result.Result<ProjectTab, AddProjectError> =
      await this.addProject(item);

    if (Result.isFailure(result)) {
      throw new ServerError({
        message: result.error.code,
        customData:
          'customData' in result.error ? result.error.customData : undefined,
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
  }): Result.ResultAsync<ProjectTab, AddProjectError> {
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

    let diskResult: Result.Result<ToDiskCreateProjectOutput, SendToDiskError> =
      await this.rpcService.sendToDisk({
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
      RebuildStructOutput,
      RebuildStructError
    > = await this.blockmlService.rebuildStruct({
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
      RebuildStructOutput,
      RebuildStructError
    > = await this.blockmlService.rebuildStruct({
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

    let persistence: Result.Result<PackerOutput, WriteError> =
      await this.db.write({
        insert: {
          projects: [newProject],
          envs: [prodEnv],
          members: [newMember],
          branches: [prodBranch, devBranch],
          bridges: [prodBranchBridgeProdEnv, devBranchBridgeProdEnv]
        }
      });

    if (Result.isFailure(persistence)) {
      return persistence;
    }

    return Result.succeed(newProject);
  }
}
