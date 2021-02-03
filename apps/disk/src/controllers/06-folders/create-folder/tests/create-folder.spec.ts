import test from 'ava';
import { api } from '~disk/barrels/api';
import { prepareTest } from '~disk/functions/prepare-test';

let testId = 'create-folder';

let traceId = '123';
let organizationId = testId;
let projectId = 'p1';

test('1', async t => {
  let resp: api.ToDiskCreateFolderResponse;

  try {
    let { messageService } = await prepareTest(organizationId);

    let createOrganizationRequest: api.ToDiskCreateOrganizationRequest = {
      info: {
        name: api.ToDiskRequestInfoNameEnum.ToDiskCreateOrganization,
        traceId: traceId
      },
      payload: {
        organizationId: organizationId
      }
    };

    let createProjectRequest: api.ToDiskCreateProjectRequest = {
      info: {
        name: api.ToDiskRequestInfoNameEnum.ToDiskCreateProject,
        traceId: traceId
      },
      payload: {
        organizationId: organizationId,
        projectId: projectId,
        devRepoId: 'r1',
        userAlias: 'r1'
      }
    };

    let createFolderRequest: api.ToDiskCreateFolderRequest = {
      info: {
        name: api.ToDiskRequestInfoNameEnum.ToDiskCreateFolder,
        traceId: traceId
      },
      payload: {
        organizationId: organizationId,
        projectId: projectId,
        repoId: 'r1',
        branch: 'master',
        parentNodeId: `${projectId}/`,
        folderName: 'fo1'
      }
    };

    await messageService.processMessage(createOrganizationRequest);
    await messageService.processMessage(createProjectRequest);

    resp = await messageService.processMessage(createFolderRequest);
  } catch (e) {
    api.logToConsole(e);
  }

  t.is(resp.payload.repoStatus, api.RepoStatusEnum.NeedCommit);
});
