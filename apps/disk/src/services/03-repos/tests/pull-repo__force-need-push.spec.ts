import test from 'ava';
import { api } from '~/barrels/api';
import { prepareTest } from '~/functions/prepare-test';

let testId = 'pull-repo__force-need-push';

let traceId = '123';
let organizationId = testId;
let projectId = 'p1';

test('1', async t => {
  let resp: api.ToDiskPullRepoResponse;

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

    let createDevRepoRequest: api.ToDiskCreateDevRepoRequest = {
      info: {
        name: api.ToDiskRequestInfoNameEnum.ToDiskCreateDevRepo,
        traceId: traceId
      },
      payload: {
        organizationId: organizationId,
        projectId: projectId,
        devRepoId: 'r2'
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
        content: '1',
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
        commitMessage: 'r1-commitMessage-1'
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

    let r1_master_commitRepoRequest_2: api.ToDiskCommitRepoRequest = {
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
        commitMessage: 'r1-commitMessage-2'
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

    let r2_master_createFileRequest: api.ToDiskCreateFileRequest = {
      info: {
        name: api.ToDiskRequestInfoNameEnum.ToDiskCreateFile,
        traceId: traceId
      },
      payload: {
        organizationId: organizationId,
        projectId: projectId,
        repoId: 'r2',
        branch: 'master',
        fileName: 's.view',
        parentNodeId: `${projectId}/`,
        userAlias: 'r2'
      }
    };

    let r2_master_commitRepoRequest: api.ToDiskCommitRepoRequest = {
      info: {
        name: api.ToDiskRequestInfoNameEnum.ToDiskCommitRepo,
        traceId: traceId
      },
      payload: {
        organizationId: organizationId,
        projectId: projectId,
        repoId: 'r2',
        branch: 'master',
        userAlias: 'r2',
        commitMessage: 'r2-commitMessage-3'
      }
    };

    let r2_master_pullRepoRequest: api.ToDiskPullRepoRequest = {
      info: {
        name: api.ToDiskRequestInfoNameEnum.ToDiskPullRepo,
        traceId: traceId
      },
      payload: {
        organizationId: organizationId,
        projectId: projectId,
        repoId: 'r2',
        branch: 'master',
        userAlias: 'r2'
      }
    };

    await messageService.processMessage(createOrganizationRequest);
    await messageService.processMessage(createProjectRequest);
    await messageService.processMessage(createDevRepoRequest);

    // await helper.delay(1000);

    await messageService.processMessage(r1_master_saveFileRequest_1);
    await messageService.processMessage(r1_master_commitRepoRequest_1);
    await messageService.processMessage(r1_master_saveFileRequest_2);
    await messageService.processMessage(r1_master_commitRepoRequest_2);
    await messageService.processMessage(r1_master_pushRepoRequest);

    await messageService.processMessage(r2_master_createFileRequest);
    await messageService.processMessage(r2_master_commitRepoRequest);

    resp = await messageService.processMessage(r2_master_pullRepoRequest);
  } catch (e) {
    api.logToConsole(e);
  }

  t.is(resp.payload.repoStatus, api.RepoStatusEnum.NeedPush);
});