import test from 'ava';
import { BRANCH_MAIN } from '~common/constants/top';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';
import { RepoStatusEnum } from '~common/enums/repo-status.enum';
import { ToDiskRequestInfoNameEnum } from '~common/enums/to/to-disk-request-info-name.enum';
import { makeId } from '~common/functions/make-id';
import { BaseProject } from '~common/interfaces/backend/base-project';
import { ProjectLt, ProjectSt } from '~common/interfaces/st-lt';
import { ToDiskCreateOrgRequest } from '~common/interfaces/to-disk/01-orgs/to-disk-create-org';
import { ToDiskCreateProjectRequest } from '~common/interfaces/to-disk/02-projects/to-disk-create-project';
import { ToDiskCommitRepoRequest } from '~common/interfaces/to-disk/03-repos/to-disk-commit-repo';
import { ToDiskCreateFolderRequest } from '~common/interfaces/to-disk/06-folders/to-disk-create-folder';
import {
  ToDiskDeleteFolderRequest,
  ToDiskDeleteFolderResponse
} from '~common/interfaces/to-disk/06-folders/to-disk-delete-folder';
import { logToConsoleDisk } from '~disk/functions/log-to-console-disk';
import { prepareTest } from '~disk/functions/prepare-test';

let testId = 'disk-delete-folder';

let traceId = testId;
let orgId = testId;
let projectId = makeId();
let projectName = 'p1';

test('1', async t => {
  let resp: ToDiskDeleteFolderResponse;

  let wLogger;
  let configService;

  try {
    let { messageService, diskTabService, logger, cs } =
      await prepareTest(orgId);
    wLogger = logger;
    configService = cs;

    let createOrgRequest: ToDiskCreateOrgRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskCreateOrg,
        traceId: traceId
      },
      payload: {
        orgId: orgId
      }
    };

    let projectSt: ProjectSt = {
      name: projectName
    };

    let projectLt: ProjectLt = {
      defaultBranch: BRANCH_MAIN,
      gitUrl: undefined,
      publicKey: undefined,
      privateKey: undefined,
      publicKeyEncrypted: undefined,
      privateKeyEncrypted: undefined,
      passPhrase: undefined
    };

    let baseProject: BaseProject = {
      orgId: orgId,
      projectId: projectId,
      remoteType: ProjectRemoteTypeEnum.Managed,
      st: diskTabService.encrypt({ data: projectSt }),
      lt: diskTabService.encrypt({ data: projectLt })
    };

    let createProjectRequest: ToDiskCreateProjectRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskCreateProject,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        baseProject: baseProject,
        devRepoId: 'r1',
        userAlias: 'u1'
      }
    };

    let createFolderRequest: ToDiskCreateFolderRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskCreateFolder,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        baseProject: baseProject,
        repoId: 'r1',
        branch: BRANCH_MAIN,
        parentNodeId: `${projectId}/`,
        folderName: 'fo1'
      }
    };

    let deleteFolderRequest: ToDiskDeleteFolderRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskDeleteFolder,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        baseProject: baseProject,
        repoId: 'r1',
        branch: BRANCH_MAIN,
        folderNodeId: `${projectId}/fo1`
      }
    };

    let commitRepoRequest: ToDiskCommitRepoRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskCommitRepo,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        baseProject: baseProject,
        repoId: 'r1',
        branch: BRANCH_MAIN,
        userAlias: 'u1',
        commitMessage: 'commitMessage-1'
      }
    };

    await messageService.processMessage(createOrgRequest);
    await messageService.processMessage(createProjectRequest);

    await messageService.processMessage(createFolderRequest);
    await messageService.processMessage(commitRepoRequest);

    resp = await messageService.processMessage(deleteFolderRequest);
  } catch (e) {
    logToConsoleDisk({
      log: e,
      logLevel: LogLevelEnum.Error,
      logger: wLogger,
      cs: configService
    });
  }

  t.is(resp.payload.repo.repoStatus, RepoStatusEnum.NeedPush);
});
