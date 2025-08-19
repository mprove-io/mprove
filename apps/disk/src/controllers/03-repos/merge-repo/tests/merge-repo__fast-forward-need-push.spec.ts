import test from 'ava';
import { BRANCH_MAIN } from '~common/constants/top';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';
import { RepoStatusEnum } from '~common/enums/repo-status.enum';
import { ToDiskRequestInfoNameEnum } from '~common/enums/to/to-disk-request-info-name.enum';
import { makeId } from '~common/functions/make-id';
import { ToDiskCreateOrgRequest } from '~common/interfaces/to-disk/01-orgs/to-disk-create-org';
import { ToDiskCreateProjectRequest } from '~common/interfaces/to-disk/02-projects/to-disk-create-project';
import { ToDiskCommitRepoRequest } from '~common/interfaces/to-disk/03-repos/to-disk-commit-repo';
import {
  ToDiskMergeRepoRequest,
  ToDiskMergeRepoResponse
} from '~common/interfaces/to-disk/03-repos/to-disk-merge-repo';
import { ToDiskCreateBranchRequest } from '~common/interfaces/to-disk/05-branches/to-disk-create-branch';
import { ToDiskSaveFileRequest } from '~common/interfaces/to-disk/07-files/to-disk-save-file';
import { logToConsoleDisk } from '~disk/functions/log-to-console-disk';
import { prepareTest } from '~disk/functions/prepare-test';

let testId = 'disk-merge-repo__fast-forward-need-push';

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

    let createProjectRequest: ToDiskCreateProjectRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskCreateProject,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        projectId: projectId,
        projectName: projectName,
        devRepoId: 'r1',
        userAlias: 'u1',
        remoteType: ProjectRemoteTypeEnum.Managed
      }
    };

    let r1_createBranchRequest: ToDiskCreateBranchRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskCreateBranch,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        projectId: projectId,
        repoId: 'r1',
        fromBranch: BRANCH_MAIN,
        newBranch: 'b2',
        isFromRemote: false,
        remoteType: ProjectRemoteTypeEnum.Managed
      }
    };

    let r1_master_saveFileRequest_1: ToDiskSaveFileRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskSaveFile,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        projectId: projectId,
        repoId: 'r1',
        branch: BRANCH_MAIN,
        fileNodeId: `${projectId}/readme.md`,
        content: '1',
        userAlias: 'u1',
        remoteType: ProjectRemoteTypeEnum.Managed
      }
    };

    let r1_master_commitRepoRequest_1: ToDiskCommitRepoRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskCommitRepo,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        projectId: projectId,
        repoId: 'r1',
        branch: BRANCH_MAIN,
        userAlias: 'u1',
        commitMessage: 'r1-commitMessage-1',
        remoteType: ProjectRemoteTypeEnum.Managed
      }
    };

    let r1_master_saveFileRequest_2: ToDiskSaveFileRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskSaveFile,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        projectId: projectId,
        repoId: 'r1',
        branch: BRANCH_MAIN,
        fileNodeId: `${projectId}/readme.md`,
        content: '2',
        userAlias: 'u1',
        remoteType: ProjectRemoteTypeEnum.Managed
      }
    };

    let r1_master_commitRepoRequest_2: ToDiskCommitRepoRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskCommitRepo,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        projectId: projectId,
        repoId: 'r1',
        branch: BRANCH_MAIN,
        userAlias: 'u1',
        commitMessage: 'r1-commitMessage-2',
        remoteType: ProjectRemoteTypeEnum.Managed
      }
    };

    let b2_mergeRepoRequest: ToDiskMergeRepoRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskMergeRepo,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        projectId: projectId,
        repoId: 'r1',
        branch: 'b2',
        userAlias: 'u1',
        theirBranch: BRANCH_MAIN,
        isTheirBranchRemote: false,
        remoteType: ProjectRemoteTypeEnum.Managed
      }
    };

    await messageService.processMessage(createOrgRequest);
    await messageService.processMessage(createProjectRequest);

    // await helper.delay(1000);

    await messageService.processMessage(r1_master_saveFileRequest_1);
    await messageService.processMessage(r1_master_commitRepoRequest_1);

    await messageService.processMessage(r1_createBranchRequest);

    await messageService.processMessage(r1_master_saveFileRequest_2);
    await messageService.processMessage(r1_master_commitRepoRequest_2);

    resp = await messageService.processMessage(b2_mergeRepoRequest);
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
