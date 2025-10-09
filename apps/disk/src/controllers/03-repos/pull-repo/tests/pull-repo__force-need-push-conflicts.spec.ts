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
import { ToDiskCreateDevRepoRequest } from '~common/interfaces/to-disk/03-repos/to-disk-create-dev-repo';
import {
  ToDiskPullRepoRequest,
  ToDiskPullRepoResponse
} from '~common/interfaces/to-disk/03-repos/to-disk-pull-repo';
import { ToDiskPushRepoRequest } from '~common/interfaces/to-disk/03-repos/to-disk-push-repo';
import { ToDiskSaveFileRequest } from '~common/interfaces/to-disk/07-files/to-disk-save-file';
import { DiskConfig } from '~disk/config/disk-config';
import { logToConsoleDisk } from '~disk/functions/log-to-console-disk';
import { prepareTest } from '~disk/functions/prepare-test';
import { encryptData } from '~node-common/functions/tab/encrypt-data';

let testId = 'disk-pull-repo__force-need-push-conflicts';

let traceId = testId;
let orgId = testId;
let projectId = makeId();
let projectName = 'p1';

test('1', async t => {
  let resp: ToDiskPullRepoResponse;

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

    let projectSt: ProjectSt = {
      name: projectName
    };

    let projectLt: ProjectLt = {
      defaultBranch: BRANCH_MAIN,
      gitUrl: undefined,
      privateKey: undefined,
      publicKey: undefined
    };

    let baseProject: BaseProject = {
      orgId: orgId,
      projectId: projectId,
      remoteType: ProjectRemoteTypeEnum.Managed,
      st: encryptData({
        data: projectSt,
        keyBase64: cs.get<DiskConfig['aesKey']>('aesKey')
      }),
      lt: encryptData({
        data: projectLt,
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

    let createDevRepoRequest: ToDiskCreateDevRepoRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskCreateDevRepo,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        baseProject: baseProject,
        devRepoId: 'r2'
      }
    };

    let r1_master_saveFileRequest_1: ToDiskSaveFileRequest = {
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

    let r1_master_commitRepoRequest_1: ToDiskCommitRepoRequest = {
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
        commitMessage: 'r1-commitMessage-1'
      }
    };

    let r1_master_saveFileRequest_2: ToDiskSaveFileRequest = {
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
        content: '2',
        userAlias: 'u1'
      }
    };

    let r1_master_commitRepoRequest_2: ToDiskCommitRepoRequest = {
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
        commitMessage: 'r1-commitMessage-2'
      }
    };

    let r1_master_pushRepoRequest: ToDiskPushRepoRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskPushRepo,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        baseProject: baseProject,
        repoId: 'r1',
        branch: BRANCH_MAIN,
        userAlias: 'u1'
      }
    };

    let r2_master_saveFileRequest: ToDiskSaveFileRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskSaveFile,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        baseProject: baseProject,
        repoId: 'r2',
        branch: BRANCH_MAIN,
        fileNodeId: `${projectId}/readme.md`,
        content: '3',
        userAlias: 'u2'
      }
    };

    let r2_master_commitRepoRequest: ToDiskCommitRepoRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskCommitRepo,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        baseProject: baseProject,
        repoId: 'r2',
        branch: BRANCH_MAIN,
        userAlias: 'u2',
        commitMessage: 'r2-commitMessage-3'
      }
    };

    let r2_master_pullRepoRequest: ToDiskPullRepoRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskPullRepo,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        baseProject: baseProject,
        repoId: 'r2',
        branch: BRANCH_MAIN,
        userAlias: 'u2'
      }
    };

    await messageService.processMessage(createOrgRequest);
    await messageService.processMessage(createProjectRequest);
    await messageService.processMessage(createDevRepoRequest);

    // await helper.delay(1000);

    await messageService.processMessage(r1_master_saveFileRequest_1);
    await messageService.processMessage(r1_master_commitRepoRequest_1);
    await messageService.processMessage(r1_master_saveFileRequest_2);
    await messageService.processMessage(r1_master_commitRepoRequest_2);
    await messageService.processMessage(r1_master_pushRepoRequest);

    await messageService.processMessage(r2_master_saveFileRequest);
    await messageService.processMessage(r2_master_commitRepoRequest);

    resp = await messageService.processMessage(r2_master_pullRepoRequest);
  } catch (e) {
    logToConsoleDisk({
      log: e,
      logLevel: LogLevelEnum.Error,
      logger: wLogger,
      cs: configService
    });
  }

  t.is(resp.payload.repo.repoStatus, RepoStatusEnum.NeedPush);
  t.is(resp.payload.repo.conflicts.length > 0, true);
});
