import test from 'ava';
import { BRANCH_MAIN } from '#common/constants/top';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { makeId } from '#common/functions/make-id';
import type { BaseProject } from '#common/zod/backend/base-project';
import type { ProjectLt, ProjectSt } from '#common/zod/st-lt';
import type { ToDiskCreateOrgRequest } from '#common/zod/to-disk/01-orgs/create-org/create-org-request';
import type { ToDiskCreateProjectRequest } from '#common/zod/to-disk/02-projects/create-project/create-project-request';
import type { ToDiskIsBranchExistRequest } from '#common/zod/to-disk/05-branches/is-branch-exist/is-branch-exist-request';
import type { ToDiskIsBranchExistResponse } from '#common/zod/to-disk/05-branches/is-branch-exist/is-branch-exist-response';
import { logToConsoleDisk } from '#disk/functions/log-to-console-disk';
import { prepareTest } from '#disk/functions/prepare-test';

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
      operation: 'createOrg',
      traceId: traceId,
      input: {
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
      operation: 'createProject',
      traceId: traceId,
      input: {
        baseProject: baseProject,
        devRepoId: 'r1',
        userAlias: 'u1'
      }
    };

    let isBranchExistRequest_1: ToDiskIsBranchExistRequest = {
      operation: 'isBranchExist',
      traceId: traceId,
      input: {
        baseProject: baseProject,
        repoId: 'r1',
        branch: BRANCH_MAIN,
        isRemote: false
      }
    };

    let isBranchExistRequest_2: ToDiskIsBranchExistRequest = {
      operation: 'isBranchExist',
      traceId: traceId,
      input: {
        baseProject: baseProject,
        repoId: 'r1',
        branch: BRANCH_MAIN,
        isRemote: true
      }
    };

    let isBranchExistRequest_3: ToDiskIsBranchExistRequest = {
      operation: 'isBranchExist',
      traceId: traceId,
      input: {
        baseProject: baseProject,
        repoId: 'r1',
        branch: 'unknown_branch',
        isRemote: false
      }
    };

    let isBranchExistRequest_4: ToDiskIsBranchExistRequest = {
      operation: 'isBranchExist',
      traceId: traceId,
      input: {
        baseProject: baseProject,
        repoId: 'r1',
        branch: 'unknown_branch',
        isRemote: true
      }
    };

    await messageService.processRequest({ request: createOrgRequest });
    await messageService.processRequest({ request: createProjectRequest });

    resp1 = await messageService.processRequest({
      request: isBranchExistRequest_1
    });
    resp2 = await messageService.processRequest({
      request: isBranchExistRequest_2
    });
    resp3 = await messageService.processRequest({
      request: isBranchExistRequest_3
    });
    resp4 = await messageService.processRequest({
      request: isBranchExistRequest_4
    });
  } catch (e) {
    logToConsoleDisk({
      log: e,
      logLevel: LogLevelEnum.Error,
      logger: wLogger,
      cs: configService
    });
  }

  t.is(resp1.result.type, 'Success');

  if (resp1.result.type !== 'Success') {
    return;
  }

  t.is(resp2.result.type, 'Success');

  if (resp2.result.type !== 'Success') {
    return;
  }

  t.is(resp3.result.type, 'Success');

  if (resp3.result.type !== 'Success') {
    return;
  }

  t.is(resp4.result.type, 'Success');

  if (resp4.result.type !== 'Success') {
    return;
  }

  t.is(resp1.result.value.isBranchExist, true);
  t.is(resp2.result.value.isBranchExist, true);
  t.is(resp3.result.value.isBranchExist, false);
  t.is(resp4.result.value.isBranchExist, false);
});
