import { Test, TestingModule } from '@nestjs/testing';
import { StructService } from '../../../services/struct.service';
import { api } from '../../../barrels/api';
import { enums } from '../../../barrels/enums';
import { barYaml } from '../../../barrels/bar-yaml';
import * as fse from 'fs-extra';

let pack = '1-yaml';
let testId = '1-collect-files';

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

  let out = fse.readFileSync(
    `src/logs/${structId}/${pack}/${testId}${enums.LogEnum.Out.toString()}.log`
  );

  let files: api.File[] = (await api.transformValid({
    classType: api.File,
    object: out.toString(),
    errorMessage: api.ErEnum.M_BLOCKML_WRONG_TEST_TRANSFORM_AND_VALIDATE
  })) as api.File[];

  expect(files.length).toBe(4);
});
