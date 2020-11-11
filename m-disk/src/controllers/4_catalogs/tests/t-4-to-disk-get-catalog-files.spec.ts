import { api } from '../../../barrels/api';
import { helper } from '../../../barrels/helper';

let testId = 't-4-to-disk-get-catalog-files';

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

  let getCatalogFilesRequest: api.ToDiskGetCatalogFilesRequest = {
    info: {
      name: api.ToDiskRequestInfoNameEnum.ToDiskGetCatalogFiles,
      traceId: traceId
    },
    payload: {
      organizationId: organizationId,
      projectId: projectId,
      repoId: 'r1',
      branch: 'master'
    }
  };

  await messageService.processRequest(createOrganizationRequest);
  await messageService.processRequest(createProjectRequest);

  let resp = <api.ToDiskGetCatalogFilesResponse>(
    await messageService.processRequest(getCatalogFilesRequest)
  );

  expect(resp.payload.files[0].fileNodeId).toBe('p1/readme.md');
  expect(resp.payload.files[0].content).toBe('# P1');
});
