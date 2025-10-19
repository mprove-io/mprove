import test from 'ava';
import { BRANCH_MAIN, PROD_REPO_ID } from '~common/constants/top';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';
import { ToDiskRequestInfoNameEnum } from '~common/enums/to/to-disk-request-info-name.enum';
import { makeId } from '~common/functions/make-id';
import { BaseProject } from '~common/interfaces/backend/base-project';
import { ProjectLt, ProjectSt } from '~common/interfaces/st-lt';
import { ToDiskCreateOrgRequest } from '~common/interfaces/to-disk/01-orgs/to-disk-create-org';
import { ToDiskCreateProjectRequest } from '~common/interfaces/to-disk/02-projects/to-disk-create-project';
import { ToDiskPushRepoRequest } from '~common/interfaces/to-disk/03-repos/to-disk-push-repo';
import { ToDiskCreateBranchRequest } from '~common/interfaces/to-disk/05-branches/to-disk-create-branch';
import {
  ToDiskDeleteBranchRequest,
  ToDiskDeleteBranchResponse
} from '~common/interfaces/to-disk/05-branches/to-disk-delete-branch';
import { logToConsoleDisk } from '~disk/functions/log-to-console-disk';
import { prepareTest } from '~disk/functions/prepare-test';

let testId = 'disk-delete-branch__remote';

let traceId = testId;
let orgId = testId;
let projectId = makeId();
let projectName = 'p1';

test('1', async t => {
  let resp: ToDiskDeleteBranchResponse;

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

    let createBranchRequest: ToDiskCreateBranchRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskCreateBranch,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        baseProject: baseProject,
        repoId: 'r1',
        newBranch: 'b2',
        fromBranch: BRANCH_MAIN,
        isFromRemote: true
      }
    };

    let pushRepoRequest: ToDiskPushRepoRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskPushRepo,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        baseProject: baseProject,
        repoId: 'r1',
        branch: 'b2',
        userAlias: 'u1'
      }
    };

    let deleteBranchRequest: ToDiskDeleteBranchRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskDeleteBranch,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        baseProject: baseProject,
        repoId: PROD_REPO_ID,
        branch: 'b2'
      }
    };

    await messageService.processMessage(createOrgRequest);
    await messageService.processMessage(createProjectRequest);

    await messageService.processMessage(createBranchRequest);
    await messageService.processMessage(pushRepoRequest);

    resp = await messageService.processMessage(deleteBranchRequest);
  } catch (e) {
    logToConsoleDisk({
      log: e,
      logLevel: LogLevelEnum.Error,
      logger: wLogger,
      cs: configService
    });
  }

  t.is(resp.payload.deletedBranch, 'b2');
});
