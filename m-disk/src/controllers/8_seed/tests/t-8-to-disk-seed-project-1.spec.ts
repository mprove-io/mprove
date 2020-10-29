import { Test, TestingModule } from '@nestjs/testing';
import { constants } from '../../../barrels/constants';
import { disk } from '../../../barrels/disk';
import { api } from '../../../barrels/api';
import { MessageService } from '../../../services/message.service';

let testId = 't-8-to-disk-seed-project-1';

let traceId = '123';
let organizationId = testId;
let projectId = 'project_1';

let orgDir = `${constants.ORGANIZATIONS_PATH}/${organizationId}`;

let messageService: MessageService;

beforeEach(async () => {
  let moduleRef: TestingModule = await Test.createTestingModule({
    controllers: [],
    providers: [MessageService]
  }).compile();

  messageService = moduleRef.get<MessageService>(MessageService);

  let isOrgExist = await disk.isPathExist(orgDir);
  if (isOrgExist === true) {
    await disk.removePath(orgDir);
  }
});

test(testId, async () => {
  let seedProjectRequest: api.ToDiskSeedProjectRequest = {
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

  let seedProjectResponse = <api.ToDiskSeedProjectResponse>(
    await messageService.processRequest(seedProjectRequest)
  );

  expect(seedProjectResponse.payload.repoStatus).toBe(api.RepoStatusEnum.Ok);
  expect(seedProjectResponse.payload.files[0].content).toBe('# text');
});
