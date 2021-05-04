import test from 'ava';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { prepareTest } from '~disk/functions/prepare-test';

let testId = 'disk-get-catalog-nodes';

let traceId = testId;
let orgId = testId;
let projectId = 'p1';

test('1', async t => {
  let resp: apiToDisk.ToDiskGetCatalogNodesResponse;

  try {
    let { messageService } = await prepareTest(orgId);

    let createOrgRequest: apiToDisk.ToDiskCreateOrgRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateOrg,
        traceId: traceId
      },
      payload: {
        orgId: orgId
      }
    };

    let createProjectRequest: apiToDisk.ToDiskCreateProjectRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateProject,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        projectId: projectId,
        devRepoId: 'r1',
        userAlias: 'u1'
      }
    };

    let getCatalogNodesRequest: apiToDisk.ToDiskGetCatalogNodesRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskGetCatalogNodes,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        projectId: projectId,
        repoId: 'r1',
        branch: 'master'
      }
    };

    await messageService.processMessage(createOrgRequest);
    await messageService.processMessage(createProjectRequest);

    resp = await messageService.processMessage(getCatalogNodesRequest);
  } catch (e) {
    common.logToConsole(e);
  }

  t.is(resp.payload.repo.nodes[0].children[0].id, 'p1/readme.md');
});
