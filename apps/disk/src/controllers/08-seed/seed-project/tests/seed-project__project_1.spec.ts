import test from 'ava';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { prepareTest } from '~disk/functions/prepare-test';

const testId = 'seed-project__project_1';

const traceId = '123';
const orgId = testId;
const projectId = 'project_1';

test('1', async t => {
  let resp: apiToDisk.ToDiskSeedProjectResponse;

  try {
    const { messageService } = await prepareTest(orgId);

    const seedProjectRequest: apiToDisk.ToDiskSeedProjectRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskSeedProject,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        projectId: projectId,
        devRepoId: 'r1',
        userAlias: 'r1'
      }
    };

    resp = await messageService.processMessage(seedProjectRequest);
  } catch (e) {
    common.logToConsole(e);
  }

  t.is(resp.payload.repoStatus, apiToDisk.RepoStatusEnum.Ok);
  t.is(resp.payload.files[0].fileId, 'r.md');
});
