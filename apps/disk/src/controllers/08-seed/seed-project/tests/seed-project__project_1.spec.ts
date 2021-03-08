import test from 'ava';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { prepareTest } from '~disk/functions/prepare-test';

let testId = 'disk-seed-project__project_1';

let traceId = '123';

let orgId = testId;
let projectId = 'p1';
let testProjectId = 'project_1';

test('1', async t => {
  let resp: apiToDisk.ToDiskSeedProjectResponse;

  try {
    let { messageService } = await prepareTest(orgId);

    let seedProjectRequest: apiToDisk.ToDiskSeedProjectRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskSeedProject,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        projectId: projectId,
        testProjectId: testProjectId,
        devRepoId: 'r1',
        userAlias: 'r1'
      }
    };

    resp = await messageService.processMessage(seedProjectRequest);
  } catch (e) {
    common.logToConsole(e);
  }

  t.is(resp.payload.repo.repoStatus, common.RepoStatusEnum.Ok);
  t.is(resp.payload.files[0].fileId, 'readme.md');
});
