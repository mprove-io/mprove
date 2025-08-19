import test from 'ava';
import { BRANCH_MAIN } from '~common/constants/top';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';
import { ToDiskRequestInfoNameEnum } from '~common/enums/to/to-disk-request-info-name.enum';
import { makeId } from '~common/functions/make-id';
import { ToDiskCreateOrgRequest } from '~common/interfaces/to-disk/01-orgs/to-disk-create-org';
import { ToDiskCreateProjectRequest } from '~common/interfaces/to-disk/02-projects/to-disk-create-project';
import { ToDiskCreateBranchRequest } from '~common/interfaces/to-disk/05-branches/to-disk-create-branch';
import {
  ToDiskDeleteBranchRequest,
  ToDiskDeleteBranchResponse
} from '~common/interfaces/to-disk/05-branches/to-disk-delete-branch';
import { logToConsoleDisk } from '~disk/functions/log-to-console-disk';
import { prepareTest } from '~disk/functions/prepare-test';

let testId = 'disk-delete-branch__local';

let traceId = testId;
let orgId = testId;
let projectId = makeId();
let projectName = 'p1';

test('1', async t => {
  let resp: ToDiskDeleteBranchResponse;

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

    let createBranchRequest: ToDiskCreateBranchRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskCreateBranch,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        projectId: projectId,
        repoId: 'r1',
        newBranch: 'b2',
        fromBranch: BRANCH_MAIN,
        isFromRemote: true,
        remoteType: ProjectRemoteTypeEnum.Managed
      }
    };

    let deleteBranchRequest: ToDiskDeleteBranchRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskDeleteBranch,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        projectId: projectId,
        repoId: 'r1',
        branch: 'b2',
        remoteType: ProjectRemoteTypeEnum.Managed,
        defaultBranch: BRANCH_MAIN
      }
    };

    await messageService.processMessage(createOrgRequest);
    await messageService.processMessage(createProjectRequest);

    await messageService.processMessage(createBranchRequest);

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
