import test from 'ava';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { prepareTest } from '~disk/functions/prepare-test';

let testId = 'disk-rename-catalog-node__file';

let traceId = testId;
let orgId = testId;
let projectId = common.makeId();

test('1', async t => {
  let resp: apiToDisk.ToDiskRenameCatalogNodeResponse;

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
        userAlias: 'u1',
        remoteType: common.ProjectRemoteTypeEnum.Managed
      }
    };

    let renameCatalogNodeRequest: apiToDisk.ToDiskRenameCatalogNodeRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskRenameCatalogNode,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        projectId: projectId,
        repoId: 'r1',
        branch: common.BRANCH_MASTER,
        nodeId: 'p1/readme.md',
        newName: 'r.md',
        remoteType: common.ProjectRemoteTypeEnum.Managed
      }
    };

    await messageService.processMessage(createOrgRequest);
    await messageService.processMessage(createProjectRequest);

    resp = await messageService.processMessage(renameCatalogNodeRequest);
  } catch (e) {
    common.logToConsole(e);
  }

  t.is(resp.payload.repo.nodes[0].children[0].id, 'p1/r.md');
});
