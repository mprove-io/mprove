import { Test, TestingModule } from '@nestjs/testing';
import { StructService } from '../../../../services/struct.service';
import { api } from '../../../../barrels/api';
import { barYaml } from '../../../../barrels/bar-yaml';

let testId = 't-1-1-collect-files';

// let structService: StructService;

// beforeEach(async () => {
//   let moduleRef: TestingModule = await Test.createTestingModule({
//     controllers: [],
//     providers: [StructService]
//   }).compile();

//   structService = moduleRef.get<StructService>(StructService);
// });

test(testId, async () => {
  let dir = 'src/models/1-yaml/1-collect-files/tests/data';

  let files: api.File[] = await barYaml.collectFiles({ dir: dir });

  expect(files.length).toBe(4);
});
