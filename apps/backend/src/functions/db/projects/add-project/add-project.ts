import type { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BackendConfig } from '#backend/config/backend-config';
import type { BranchTab } from '#backend/drizzle/postgres/tables/branches';
import type { BridgeTab } from '#backend/drizzle/postgres/tables/bridges';
import type { ConnectionTab } from '#backend/drizzle/postgres/tables/connections';
import type { EnvTab } from '#backend/drizzle/postgres/tables/envs';
import type { MemberTab } from '#backend/drizzle/postgres/tables/members';
import type { ProjectTab } from '#backend/drizzle/postgres/tables/projects';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import {
  type RebuildBlockmlStructOutput,
  rebuildBlockmlStruct
} from '#backend/functions/blockml/rebuild-blockml-struct/rebuild-blockml-struct';
import { makeBranch } from '#backend/functions/db/branches/make-branch/make-branch';
import { makeBridge } from '#backend/functions/db/bridges/make-bridge/make-bridge';
import { makeEnv } from '#backend/functions/db/envs/make-env/make-env';
import { makeMember } from '#backend/functions/db/members/make-member/make-member';
import { projectTabToBaseProject } from '#backend/functions/db/projects/project-tab-to-base-project/project-tab-to-base-project';
import type { DbService } from '#backend/services/db/db.service';
import type { RpcService } from '#backend/services/rpc/rpc.service';
import type { TabService } from '#backend/services/tab/tab.service';
import { PROD_REPO_ID, PROJECT_ENV_PROD } from '#common/constants/top';
import { makeId } from '#common/functions/make-id/make-id';
import type { AddProjectError } from '#common/types/backend/function-errors/add-project-error';
import type { RebuildBlockmlStructError } from '#common/types/backend/function-errors/rebuild-blockml-struct-error';
import type { SendToDiskError } from '#common/types/backend/function-errors/send-to-disk-error';
import type { WriteError } from '#common/types/backend/function-errors/write-error';
import type { Ev } from '#common/types/backend/parts/ev';
import type { BaseProject } from '#common/types/backend/parts/project/base-project';
import type { ProjectRemoteType } from '#common/types/backend/parts/project/project-remote-type';
import type { ToDiskCreateProjectOutput } from '#common/types/disk/routes/projects/create-project/create-project-output';

export async function addProject(item: {
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
  tabService: TabService;
  rpcService: RpcService;
  db: DbService;
  cs: ConfigService<BackendConfig>;
  logger: Logger;
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
    traceId,
    tabService,
    rpcService,
    db,
    cs,
    logger
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

  let baseProject: BaseProject = projectTabToBaseProject({
    tabService: tabService,
    project: newProject
  });

  let diskResult: Result.Result<ToDiskCreateProjectOutput, SendToDiskError> =
    await rpcService.sendToDisk({
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

  let prodEnv: EnvTab = makeEnv({
    projectId: newProject.projectId,
    envId: PROJECT_ENV_PROD,
    evs: evs
  });

  let newMember: MemberTab = makeMember({
    projectId: newProject.projectId,
    user: user,
    isAdmin: true,
    isEditor: true,
    isExplorer: true
  });

  let devStructId: string = makeId();

  let prodStructId: string = makeId();

  let prodBranch: BranchTab = makeBranch({
    projectId: newProject.projectId,
    repoId: PROD_REPO_ID,
    branchId: newProject.defaultBranch
  });

  let devBranch: BranchTab = makeBranch({
    projectId: newProject.projectId,
    repoId: user.userId,
    branchId: newProject.defaultBranch
  });

  let prodBranchBridgeProdEnv: BridgeTab = makeBridge({
    projectId: prodBranch.projectId,
    repoId: prodBranch.repoId,
    branchId: prodBranch.branchId,
    envId: prodEnv.envId,
    structId: prodStructId,
    needValidate: false
  });

  let devBranchBridgeProdEnv: BridgeTab = makeBridge({
    projectId: devBranch.projectId,
    repoId: devBranch.repoId,
    branchId: devBranch.branchId,
    envId: prodEnv.envId,
    structId: devStructId,
    needValidate: false
  });

  let prodStructResult: Result.Result<
    RebuildBlockmlStructOutput,
    RebuildBlockmlStructError
  > = await rebuildBlockmlStruct({
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
    connections: connections,
    db: db,
    tabService: tabService,
    rpcService: rpcService,
    cs: cs,
    logger: logger
  });

  if (Result.isFailure(prodStructResult)) {
    return prodStructResult;
  }

  let devStructResult: Result.Result<
    RebuildBlockmlStructOutput,
    RebuildBlockmlStructError
  > = await rebuildBlockmlStruct({
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
    connections: connections,
    db: db,
    tabService: tabService,
    rpcService: rpcService,
    cs: cs,
    logger: logger
  });

  if (Result.isFailure(devStructResult)) {
    return devStructResult;
  }

  let persistence: Result.Result<void, WriteError> = await db.write({
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
