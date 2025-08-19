import test from 'ava';
import { BRANCH_MAIN } from '~common/constants/top';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';
import { ToDiskRequestInfoNameEnum } from '~common/enums/to/to-disk-request-info-name.enum';
import { makeId } from '~common/functions/make-id';
import { ToDiskCreateOrgRequest } from '~common/interfaces/to-disk/01-orgs/to-disk-create-org';
import { ToDiskCreateProjectRequest } from '~common/interfaces/to-disk/02-projects/to-disk-create-project';
import {
  ToDiskMoveCatalogNodeRequest,
  ToDiskMoveCatalogNodeResponse
} from '~common/interfaces/to-disk/04-catalogs/to-disk-move-catalog-node';
import { ToDiskCreateFolderRequest } from '~common/interfaces/to-disk/06-folders/to-disk-create-folder';
import { logToConsoleDisk } from '~disk/functions/log-to-console-disk';
import { prepareTest } from '~disk/functions/prepare-test';

let testId = 'disk-move-catalog-node__folder';

let traceId = testId;
let orgId = testId;
let projectId = makeId();
let projectName = 'p1';

test('1', async t => {
  let resp: ToDiskMoveCatalogNodeResponse;

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

    let createFolderRequest_1: ToDiskCreateFolderRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskCreateFolder,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        projectId: projectId,
        repoId: 'r1',
        branch: BRANCH_MAIN,
        parentNodeId: `${projectId}/`,
        folderName: 'fo1',
        remoteType: ProjectRemoteTypeEnum.Managed
      }
    };

    let createFolderRequest_2: ToDiskCreateFolderRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskCreateFolder,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        projectId: projectId,
        repoId: 'r1',
        branch: BRANCH_MAIN,
        parentNodeId: `${projectId}/`,
        folderName: 'fo2',
        remoteType: ProjectRemoteTypeEnum.Managed
      }
    };

    let moveCatalogNodeRequest: ToDiskMoveCatalogNodeRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskMoveCatalogNode,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        projectId: projectId,
        repoId: 'r1',
        branch: BRANCH_MAIN,
        fromNodeId: `${projectId}/fo2`,
        toNodeId: `${projectId}/fo1/fo2`,
        remoteType: ProjectRemoteTypeEnum.Managed
      }
    };

    await messageService.processMessage(createOrgRequest);
    await messageService.processMessage(createProjectRequest);

    await messageService.processMessage(createFolderRequest_1);
    await messageService.processMessage(createFolderRequest_2);

    resp = await messageService.processMessage(moveCatalogNodeRequest);
  } catch (e) {
    logToConsoleDisk({
      log: e,
      logLevel: LogLevelEnum.Error,
      logger: wLogger,
      cs: configService
    });
  }

  t.is(
    resp.payload.repo.nodes[0].children[0].children[0].id,
    `${projectId}/fo1/fo2`
  );
});
