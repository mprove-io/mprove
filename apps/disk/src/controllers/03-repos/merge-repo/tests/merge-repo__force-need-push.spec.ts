import test from 'ava';
import { BRANCH_MAIN } from '~common/constants/top';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';
import { RepoStatusEnum } from '~common/enums/repo-status.enum';
import { ToDiskRequestInfoNameEnum } from '~common/enums/to/to-disk-request-info-name.enum';
import { makeId } from '~common/functions/make-id';
import { BaseProject } from '~common/interfaces/backend/base-project';
import { ProjectLt } from '~common/interfaces/backend/project-tab';
import { ToDiskCreateOrgRequest } from '~common/interfaces/to-disk/01-orgs/to-disk-create-org';
import { ToDiskCreateProjectRequest } from '~common/interfaces/to-disk/02-projects/to-disk-create-project';
import { ToDiskCommitRepoRequest } from '~common/interfaces/to-disk/03-repos/to-disk-commit-repo';
import {
  ToDiskMergeRepoRequest,
  ToDiskMergeRepoResponse
} from '~common/interfaces/to-disk/03-repos/to-disk-merge-repo';
import { ToDiskCreateBranchRequest } from '~common/interfaces/to-disk/05-branches/to-disk-create-branch';
import { ToDiskCreateFileRequest } from '~common/interfaces/to-disk/07-files/to-disk-create-file';
import { ToDiskSaveFileRequest } from '~common/interfaces/to-disk/07-files/to-disk-save-file';
import { DiskConfig } from '~disk/config/disk-config';
import { logToConsoleDisk } from '~disk/functions/log-to-console-disk';
import { prepareTest } from '~disk/functions/prepare-test';
import { encryptData } from '~node-common/functions/tab/encrypt-data';

let testId = 'disk-merge-repo__force-need-push';

let traceId = testId;
let orgId = testId;
let projectId = makeId();
let projectName = 'p1';

test('1', async t => {
  let resp: ToDiskMergeRepoResponse;

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

    let projectTab: ProjectLt = {
      name: projectName,
      defaultBranch: BRANCH_MAIN,
      gitUrl: undefined,
      privateKey: undefined,
      publicKey: undefined
    };

    let baseProject: BaseProject = {
      orgId: orgId,
      projectId: projectId,
      remoteType: ProjectRemoteTypeEnum.Managed,
      serverTs: undefined,
      slt: encryptData({
        data: projectTab,
        keyBase64: cs.get<DiskConfig['aesKey']>('aesKey')
      })
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

    let createBranchRequest: ToDiskCreateBranchRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskCreateBranch,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        baseProject: baseProject,
        repoId: 'r1',
        fromBranch: BRANCH_MAIN,
        newBranch: 'b2',
        isFromRemote: false
      }
    };

    let r1_master_saveFileRequest: ToDiskSaveFileRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskSaveFile,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        baseProject: baseProject,
        repoId: 'r1',
        branch: BRANCH_MAIN,
        fileNodeId: `${projectId}/readme.md`,
        content: '1',
        userAlias: 'u1'
      }
    };

    let r1_master_commitRepoRequest1: ToDiskCommitRepoRequest = {
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

    let r1_b2_createFileRequest: ToDiskCreateFileRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskCreateFile,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        baseProject: baseProject,
        repoId: 'r1',
        branch: 'b2',
        fileName: 's.view',
        parentNodeId: `${projectId}/`,
        userAlias: 'u1'
      }
    };

    let r1_b2_commitRepoRequest: ToDiskCommitRepoRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskCommitRepo,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        baseProject: baseProject,
        repoId: 'r1',
        branch: 'b2',
        userAlias: 'u1',
        commitMessage: 'commitMessage-2'
      }
    };

    let r1_b2_mergeRepoRequest: ToDiskMergeRepoRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskMergeRepo,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        baseProject: baseProject,
        repoId: 'r1',
        branch: 'b2',
        userAlias: 'u1',
        theirBranch: BRANCH_MAIN,
        isTheirBranchRemote: false
      }
    };

    await messageService.processMessage(createOrgRequest);
    await messageService.processMessage(createProjectRequest);

    // await helper.delay(1000);

    await messageService.processMessage(createBranchRequest);

    await messageService.processMessage(r1_master_saveFileRequest);
    await messageService.processMessage(r1_master_commitRepoRequest1);

    await messageService.processMessage(r1_b2_createFileRequest);
    await messageService.processMessage(r1_b2_commitRepoRequest);

    resp = await messageService.processMessage(r1_b2_mergeRepoRequest);
  } catch (e) {
    logToConsoleDisk({
      log: e,
      logLevel: LogLevelEnum.Error,
      logger: wLogger,
      cs: configService
    });
  }
  // NeedPush because we merge with different branch
  t.is(resp.payload.repo.repoStatus, RepoStatusEnum.NeedPush);
});
