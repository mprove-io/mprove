import { api } from '~/barrels/api';
import { helper } from '~/barrels/helper';
import { prepareTest } from '~/functions/prepare-test';
import test from 'ava';

let testId = 'commit-repo__need-push';

let traceId = '123';
let organizationId = testId;
let projectId = 'p1';

test('1', async t => {
  let resp: api.ToDiskCommitRepoResponse;

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

    let saveFileRequest: api.ToDiskSaveFileRequest = {
      info: {
        name: api.ToDiskRequestInfoNameEnum.ToDiskSaveFile,
        traceId: traceId
      },
      payload: {
        organizationId: organizationId,
        projectId: projectId,
        repoId: 'r1',
        branch: 'master',
        fileNodeId: `${projectId}/readme.md`,
        content: '1',
        userAlias: 'r1'
      }
    };

    let commitRepoRequest: api.ToDiskCommitRepoRequest = {
      info: {
        name: api.ToDiskRequestInfoNameEnum.ToDiskCommitRepo,
        traceId: traceId
      },
      payload: {
        organizationId: organizationId,
        projectId: projectId,
        repoId: 'r1',
        branch: 'master',
        userAlias: 'r1',
        commitMessage: 'commitMessage-1'
      }
    };

    await messageService.processMessage(createOrganizationRequest);
    await messageService.processMessage(createProjectRequest);

    // await helper.delay(1000);

    await messageService.processMessage(saveFileRequest);

    resp = await messageService.processMessage(commitRepoRequest);
  } catch (e) {
    api.logToConsole(e);
  }

  t.is(resp.payload.repoStatus, api.RepoStatusEnum.NeedPush);
});
