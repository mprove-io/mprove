import { api } from '../../../barrels/api';
import { helper } from '../../../barrels/helper';

let testId = 't-7-to-disk-create-file-2';

let traceId = '123';
let organizationId = testId;
let projectId = 'p1';

test(testId, async () => {
  let { messageService } = await helper.prepareTest(organizationId);

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

  let createFileRequest: api.ToDiskCreateFileRequest = {
    info: {
      name: api.ToDiskRequestInfoNameEnum.ToDiskCreateFile,
      traceId: traceId
    },
    payload: {
      organizationId: organizationId,
      projectId: projectId,
      repoId: api.PROD_REPO_ID,
      branch: 'master',
      parentNodeId: `${projectId}/`,
      fileName: 's.view',
      userAlias: 'r1'
    }
  };

  await messageService.processRequest(createOrganizationRequest);
  await messageService.processRequest(createProjectRequest);

  let resp = <api.ToDiskCreateFileResponse>(
    await messageService.processRequest(createFileRequest)
  );

  expect(resp.payload.repoStatus).toBe(api.RepoStatusEnum.Ok);
});
