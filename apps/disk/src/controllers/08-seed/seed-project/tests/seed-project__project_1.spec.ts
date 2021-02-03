import test from 'ava';
import { api } from '~disk/barrels/api';
import { prepareTest } from '~disk/functions/prepare-test';

const testId = 'seed-project__project_1';

const traceId = '123';
const organizationId = testId;
const projectId = 'project_1';

test('1', async t => {
  let resp: api.ToDiskSeedProjectResponse;

  try {
    const { messageService } = await prepareTest(organizationId);

    const seedProjectRequest: api.ToDiskSeedProjectRequest = {
      info: {
        name: api.ToDiskRequestInfoNameEnum.ToDiskSeedProject,
        traceId: traceId
      },
      payload: {
        organizationId: organizationId,
        projectId: projectId,
        devRepoId: 'r1',
        userAlias: 'r1'
      }
    };

    resp = await messageService.processMessage(seedProjectRequest);
  } catch (e) {
    api.logToConsole(e);
  }

  t.is(resp.payload.repoStatus, api.RepoStatusEnum.Ok);
  t.is(resp.payload.files[0].fileId, 'r.md');
});
