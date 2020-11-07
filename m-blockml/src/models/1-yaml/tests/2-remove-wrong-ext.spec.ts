import { Test, TestingModule } from '@nestjs/testing';
import { StructService } from '../../../services/struct.service';
import { api } from '../../../barrels/api';
import { enums } from '../../../barrels/enums';
import * as fse from 'fs-extra';
import { interfaces } from '../../../barrels/interfaces';

let pack = '1-yaml';
let testId = '2-remove-wrong-ext';

let structService: StructService;

beforeEach(async () => {
  let moduleRef: TestingModule = await Test.createTestingModule({
    controllers: [],
    providers: [StructService]
  }).compile();

  structService = moduleRef.get<StructService>(StructService);
});

test(testId, async () => {
  let structId = api.makeStructId();

  await structService.rebuildStruct({
    dir: `src/models/${pack}/data/${testId}`,
    structId: structId,
    projectId: 'p1',
    bqProject: 'bqp1',
    connection: api.ProjectConnectionEnum.BigQuery,
    weekStart: api.ProjectWeekStartEnum.Monday
  });

  let outFile2s = fse.readFileSync(
    `src/logs/${structId}/${pack}/${testId}/${enums.LogEnum.OutFile2s.toString()}`
  );

  let outErrors = fse.readFileSync(
    `src/logs/${structId}/${pack}/${testId}/${enums.LogEnum.OutErrors.toString()}`
  );

  let file2s: interfaces.File2[] = ((await api.transformValidString({
    classType: interfaces.File2,
    jsonString: outFile2s.toString(),
    errorMessage: api.ErEnum.M_BLOCKML_WRONG_TEST_TRANSFORM_AND_VALIDATE
  })) as unknown) as interfaces.File2[];

  let errors: interfaces.BmErrorC[] = ((await api.transformValidString({
    classType: interfaces.BmErrorC,
    jsonString: outErrors.toString(),
    errorMessage: api.ErEnum.M_BLOCKML_WRONG_TEST_TRANSFORM_AND_VALIDATE
  })) as unknown) as interfaces.BmErrorC[];

  expect(file2s.length).toBe(3);
  expect(errors.length).toBe(1);
});
