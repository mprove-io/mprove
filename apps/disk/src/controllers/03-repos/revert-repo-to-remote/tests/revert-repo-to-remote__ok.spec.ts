import test from 'ava';
import { BRANCH_MAIN } from '~common/constants/top';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { PanelEnum } from '~common/enums/panel.enum';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';
import { RepoStatusEnum } from '~common/enums/repo-status.enum';
import { ToDiskRequestInfoNameEnum } from '~common/enums/to/to-disk-request-info-name.enum';
import { makeId } from '~common/functions/make-id';
import { Project } from '~common/interfaces/backend/project';
import { ToDiskCreateOrgRequest } from '~common/interfaces/to-disk/01-orgs/to-disk-create-org';
import { ToDiskCreateProjectRequest } from '~common/interfaces/to-disk/02-projects/to-disk-create-project';
import { ToDiskCommitRepoRequest } from '~common/interfaces/to-disk/03-repos/to-disk-commit-repo';
import { ToDiskPushRepoRequest } from '~common/interfaces/to-disk/03-repos/to-disk-push-repo';
import {
  ToDiskRevertRepoToRemoteRequest,
  ToDiskRevertRepoToRemoteResponse
} from '~common/interfaces/to-disk/03-repos/to-disk-revert-repo-to-remote';
import {
  ToDiskGetFileRequest,
  ToDiskGetFileResponse
} from '~common/interfaces/to-disk/07-files/to-disk-get-file';
import { ToDiskSaveFileRequest } from '~common/interfaces/to-disk/07-files/to-disk-save-file';
import { logToConsoleDisk } from '~disk/functions/log-to-console-disk';
import { prepareTest } from '~disk/functions/prepare-test';

let testId = 'disk-revert-repo-to-remote__ok';

let traceId = testId;
let orgId = testId;
let projectId = makeId();
let projectName = 'p1';

test('1', async t => {
  let resp1: ToDiskRevertRepoToRemoteResponse;
  let resp2: ToDiskGetFileResponse;
  let content1 = '1';

  let wLogger;
  let configService;

  try {
    let { messageService, logger, cs } = await prepareTest(orgId);
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

    let project: Project = {
      orgId: orgId,
      projectId: projectId,
      name: projectName,
      remoteType: ProjectRemoteTypeEnum.Managed,
      defaultBranch: BRANCH_MAIN,
      gitUrl: undefined,
      tab: {
        privateKey: undefined,
        publicKey: undefined
      },
      serverTs: undefined
    };

    let createProjectRequest: ToDiskCreateProjectRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskCreateProject,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        project: project,
        devRepoId: 'r1',
        userAlias: 'u1'
      }
    };

    let r1_master_saveFileRequest_1: ToDiskSaveFileRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskSaveFile,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        project: project,
        repoId: 'r1',
        branch: BRANCH_MAIN,
        fileNodeId: `${projectId}/readme.md`,
        content: content1,
        userAlias: 'u1'
      }
    };

    let r1_master_commitRepoRequest_1: ToDiskCommitRepoRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskCommitRepo,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        project: project,
        repoId: 'r1',
        branch: BRANCH_MAIN,
        userAlias: 'u1',
        commitMessage: 'commitMessage-1'
      }
    };

    let r1_master_pushRepoRequest: ToDiskPushRepoRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskPushRepo,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        project: project,
        repoId: 'r1',
        branch: BRANCH_MAIN,
        userAlias: 'u1'
      }
    };

    let r1_master_saveFileRequest_2: ToDiskSaveFileRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskSaveFile,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        project: project,
        repoId: 'r1',
        branch: BRANCH_MAIN,
        fileNodeId: `${projectId}/readme.md`,
        content: '2',
        userAlias: 'u1'
      }
    };

    let revertRepoToRemoteRequest: ToDiskRevertRepoToRemoteRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskRevertRepoToRemote,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        project: project,
        repoId: 'r1',
        branch: BRANCH_MAIN
      }
    };

    let getFileRequest: ToDiskGetFileRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskGetFile,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        project: project,
        repoId: 'r1',
        branch: BRANCH_MAIN,
        fileNodeId: `${projectId}/readme.md`,
        panel: PanelEnum.Tree
      }
    };

    await messageService.processMessage(createOrgRequest);
    await messageService.processMessage(createProjectRequest);

    // await helper.delay(1000);

    await messageService.processMessage(r1_master_saveFileRequest_1);
    await messageService.processMessage(r1_master_commitRepoRequest_1);
    await messageService.processMessage(r1_master_pushRepoRequest);

    await messageService.processMessage(r1_master_saveFileRequest_2);

    resp1 = await messageService.processMessage(revertRepoToRemoteRequest);

    resp2 = await messageService.processMessage(getFileRequest);
  } catch (e) {
    logToConsoleDisk({
      log: e,
      logLevel: LogLevelEnum.Error,
      logger: wLogger,
      cs: configService
    });
  }

  t.is(resp1.payload.repo.repoStatus, RepoStatusEnum.Ok);
  t.is(resp2.payload.content, content1);
});
