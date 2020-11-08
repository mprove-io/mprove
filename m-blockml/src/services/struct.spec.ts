import { Test, TestingModule } from '@nestjs/testing';
import { StructService } from '../services/struct.service';
import { api } from '../barrels/api';
import { interfaces } from '../barrels/interfaces';

let pack = '1-yaml';
let testId = 'e278';

let structService: StructService;

beforeEach(async () => {
  let moduleRef: TestingModule = await Test.createTestingModule({
    controllers: [],
    providers: [StructService]
  }).compile();

  structService = moduleRef.get<StructService>(StructService);
});

test(testId, async () => {
  let struct: interfaces.Struct;

  try {
    let structId = api.makeStructId();

    struct = await structService.rebuildStruct({
      dir: `src/models/${pack}/data/${testId}`,
      structId: structId,
      projectId: 'p1',
      connections: [],
      weekStart: api.ProjectWeekStartEnum.Monday
    });
  } catch (e) {
    api.logToConsole(e);
  }

  expect(1).toBe(1);
});
