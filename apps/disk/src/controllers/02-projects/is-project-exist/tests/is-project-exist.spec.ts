import test from 'ava';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';
import { ToDiskRequestInfoNameEnum } from '~common/enums/to/to-disk-request-info-name.enum';
import { makeId } from '~common/functions/make-id';
import { Project } from '~common/interfaces/backend/project';
import { ToDiskCreateOrgRequest } from '~common/interfaces/to-disk/01-orgs/to-disk-create-org';
import { ToDiskCreateProjectRequest } from '~common/interfaces/to-disk/02-projects/to-disk-create-project';
import {
  ToDiskIsProjectExistRequest,
  ToDiskIsProjectExistResponse
} from '~common/interfaces/to-disk/02-projects/to-disk-is-project-exist';
import { logToConsoleDisk } from '~disk/functions/log-to-console-disk';
import { prepareTest } from '~disk/functions/prepare-test';

let testId = 'disk-is-project-exist';

let traceId = testId;
let orgId = testId;
let projectId = makeId();
let projectName = 'p1';

test('1', async t => {
  let resp1: ToDiskIsProjectExistResponse;
  let resp2: ToDiskIsProjectExistResponse;

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
      defaultBranch: undefined,
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

    let isProjectExistRequest_1: ToDiskIsProjectExistRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskIsProjectExist,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        projectId: projectId
      }
    };

    let isProjectExistRequest_2: ToDiskIsProjectExistRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskIsProjectExist,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        projectId: 'unknown_project'
      }
    };

    await messageService.processMessage(createOrgRequest);
    await messageService.processMessage(createProjectRequest);

    resp1 = await messageService.processMessage(isProjectExistRequest_1);
    resp2 = await messageService.processMessage(isProjectExistRequest_2);
  } catch (e) {
    logToConsoleDisk({
      log: e,
      logLevel: LogLevelEnum.Error,
      logger: wLogger,
      cs: configService
    });
  }

  t.is(resp1.payload.isProjectExist, true);
  t.is(resp2.payload.isProjectExist, false);
});
