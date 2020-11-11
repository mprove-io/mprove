import { api } from '../../../barrels/api';
import { helper } from '../../../barrels/helper';

let testId = 't-6-to-disk-create-folder';

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

  let createFolderRequest: api.ToDiskCreateFolderRequest = {
    info: {
      name: api.ToDiskRequestInfoNameEnum.ToDiskCreateFolder,
      traceId: traceId
    },
    payload: {
      organizationId: organizationId,
      projectId: projectId,
      repoId: 'r1',
      branch: 'master',
      parentNodeId: `${projectId}/`,
      folderName: 'fo1'
    }
  };

  await messageService.processRequest(createOrganizationRequest);
  await messageService.processRequest(createProjectRequest);

  let resp = <api.ToDiskCreateFolderResponse>(
    await messageService.processRequest(createFolderRequest)
  );

  expect(resp.payload.repoStatus).toBe(api.RepoStatusEnum.NeedCommit);
});
