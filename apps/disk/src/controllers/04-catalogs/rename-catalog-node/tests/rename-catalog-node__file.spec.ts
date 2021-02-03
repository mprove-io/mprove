import test from 'ava';
import { api } from '~disk/barrels/api';
import { prepareTest } from '~disk/functions/prepare-test';

let testId = 'rename-catalog-node__file';

let traceId = '123';
let organizationId = testId;
let projectId = 'p1';

test('1', async t => {
  let resp: api.ToDiskRenameCatalogNodeResponse;

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

    let renameCatalogNodeRequest: api.ToDiskRenameCatalogNodeRequest = {
      info: {
        name: api.ToDiskRequestInfoNameEnum.ToDiskRenameCatalogNode,
        traceId: traceId
      },
      payload: {
        organizationId: organizationId,
        projectId: projectId,
        repoId: 'r1',
        branch: 'master',
        nodeId: 'p1/readme.md',
        newName: 'r.md'
      }
    };

    await messageService.processMessage(createOrganizationRequest);
    await messageService.processMessage(createProjectRequest);

    resp = await messageService.processMessage(renameCatalogNodeRequest);
  } catch (e) {
    api.logToConsole(e);
  }

  t.is(resp.payload.nodes[0].children[0].id, 'p1/r.md');
});
