import { api } from '../../../barrels/api';
import { helper } from '../../../barrels/helper';
import { prepareTest } from '../../../functions/prepare-test';
import test from 'ava';

let testId = 'revert-repo-to-production__ok';

let traceId = '123';
let organizationId = testId;
let projectId = 'p1';

test('1', async t => {
  let resp1: api.ToDiskRevertRepoToProductionResponse;
  let resp2: api.ToDiskGetFileResponse;
  let content1 = '1';

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

    let r1_master_saveFileRequest_1: api.ToDiskSaveFileRequest = {
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
        content: content1,
        userAlias: 'r1'
      }
    };

    let r1_master_commitRepoRequest_1: api.ToDiskCommitRepoRequest = {
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

    let r1_master_pushRepoRequest: api.ToDiskPushRepoRequest = {
      info: {
        name: api.ToDiskRequestInfoNameEnum.ToDiskPushRepo,
        traceId: traceId
      },
      payload: {
        organizationId: organizationId,
        projectId: projectId,
        repoId: 'r1',
        branch: 'master',
        userAlias: 'r1'
      }
    };

    let r1_master_saveFileRequest_2: api.ToDiskSaveFileRequest = {
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
        content: '2',
        userAlias: 'r1'
      }
    };

    let revertRepoToProductionRequest: api.ToDiskRevertRepoToProductionRequest = {
      info: {
        name: api.ToDiskRequestInfoNameEnum.ToDiskRevertRepoToProduction,
        traceId: traceId
      },
      payload: {
        organizationId: organizationId,
        projectId: projectId,
        repoId: 'r1',
        branch: 'master'
      }
    };

    let getFileRequest: api.ToDiskGetFileRequest = {
      info: {
        name: api.ToDiskRequestInfoNameEnum.ToDiskGetFile,
        traceId: traceId
      },
      payload: {
        organizationId: organizationId,
        projectId: projectId,
        repoId: 'r1',
        branch: 'master',
        fileNodeId: `${projectId}/readme.md`
      }
    };

    await messageService.processMessage(createOrganizationRequest);
    await messageService.processMessage(createProjectRequest);

    // await helper.delay(1000);

    await messageService.processMessage(r1_master_saveFileRequest_1);
    await messageService.processMessage(r1_master_commitRepoRequest_1);
    await messageService.processMessage(r1_master_pushRepoRequest);

    await messageService.processMessage(r1_master_saveFileRequest_2);

    resp1 = await messageService.processMessage(revertRepoToProductionRequest);

    resp2 = await messageService.processMessage(getFileRequest);
  } catch (e) {
    api.logToConsole(e);
  }

  t.is(resp1.payload.repoStatus, api.RepoStatusEnum.Ok);
  t.is(resp2.payload.content, content1);
});
