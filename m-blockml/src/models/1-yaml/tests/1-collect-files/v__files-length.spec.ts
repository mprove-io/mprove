import { Test, TestingModule } from '@nestjs/testing';
import { StructService } from '../../../../services/struct.service';
import { api } from '../../../../barrels/api';
import { enums } from '../../../../barrels/enums';
import { barYaml } from '../../../../barrels/bar-yaml';
import * as fse from 'fs-extra';

let pack = '1-yaml';
let funcId = '1-collect-files';
let testId = 'v__files-length';

let structService: StructService;

beforeEach(async () => {
  let moduleRef: TestingModule = await Test.createTestingModule({
    controllers: [],
    providers: [StructService]
  }).compile();

  structService = moduleRef.get<StructService>(StructService);
});

test(testId, async () => {
  let files: api.File[];
  try {
    let structId = api.makeStructId();

    await structService.rebuildStruct({
      dir: `src/models/${pack}/data/${funcId}/${testId}`,
      structId: structId,
      projectId: 'p1',
      connections: [],
      weekStart: api.ProjectWeekStartEnum.Monday
    });

    let outFiles = fse.readFileSync(
      `src/logs/${structId}/${pack}/${funcId}/${enums.LogEnum.Files.toString()}`
    );

    files = (await api.transformValidString({
      classType: api.File,
      jsonString: outFiles.toString(),
      errorMessage: api.ErEnum.M_BLOCKML_WRONG_TEST_TRANSFORM_AND_VALIDATE
    })) as api.File[];
  } catch (e) {
    api.logToConsole(e);
  }

  expect(files.length).toBe(5);
});
