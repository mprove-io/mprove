import test from 'ava';
import { BRANCH_MAIN } from '~common/constants/top';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';
import { ToDiskRequestInfoNameEnum } from '~common/enums/to/to-disk-request-info-name.enum';
import { makeId } from '~common/functions/make-id';
import { BaseProject } from '~common/interfaces/backend/base-project';
import { ProjectLt, ProjectSt } from '~common/interfaces/st-lt';
import { ToDiskCreateOrgRequest } from '~common/interfaces/to-disk/01-orgs/to-disk-create-org';
import { ToDiskCreateProjectRequest } from '~common/interfaces/to-disk/02-projects/to-disk-create-project';
import {
  ToDiskIsBranchExistRequest,
  ToDiskIsBranchExistResponse
} from '~common/interfaces/to-disk/05-branches/to-disk-is-branch-exist';
import { logToConsoleDisk } from '~disk/functions/log-to-console-disk';
import { prepareTest } from '~disk/functions/prepare-test';

let testId = 'disk-is-branch-exist';

let traceId = testId;
let orgId = testId;
let projectId = makeId();
let projectName = 'p1';

test('1', async t => {
  let resp1: ToDiskIsBranchExistResponse;
  let resp2: ToDiskIsBranchExistResponse;
  let resp3: ToDiskIsBranchExistResponse;
  let resp4: ToDiskIsBranchExistResponse;

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
      privateKey: undefined,
      publicKey: undefined
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

    let isBranchExistRequest_1: ToDiskIsBranchExistRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskIsBranchExist,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        baseProject: baseProject,
        repoId: 'r1',
        branch: BRANCH_MAIN,
        isRemote: false
      }
    };

    let isBranchExistRequest_2: ToDiskIsBranchExistRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskIsBranchExist,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        baseProject: baseProject,
        repoId: 'r1',
        branch: BRANCH_MAIN,
        isRemote: true
      }
    };

    let isBranchExistRequest_3: ToDiskIsBranchExistRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskIsBranchExist,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        baseProject: baseProject,
        repoId: 'r1',
        branch: 'unknown_branch',
        isRemote: false
      }
    };

    let isBranchExistRequest_4: ToDiskIsBranchExistRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskIsBranchExist,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        baseProject: baseProject,
        repoId: 'r1',
        branch: 'unknown_branch',
        isRemote: true
      }
    };

    await messageService.processMessage(createOrgRequest);
    await messageService.processMessage(createProjectRequest);

    resp1 = await messageService.processMessage(isBranchExistRequest_1);
    resp2 = await messageService.processMessage(isBranchExistRequest_2);
    resp3 = await messageService.processMessage(isBranchExistRequest_3);
    resp4 = await messageService.processMessage(isBranchExistRequest_4);
  } catch (e) {
    logToConsoleDisk({
      log: e,
      logLevel: LogLevelEnum.Error,
      logger: wLogger,
      cs: configService
    });
  }

  t.is(resp1.payload.isBranchExist, true);
  t.is(resp2.payload.isBranchExist, true);
  t.is(resp3.payload.isBranchExist, false);
  t.is(resp4.payload.isBranchExist, false);
});
