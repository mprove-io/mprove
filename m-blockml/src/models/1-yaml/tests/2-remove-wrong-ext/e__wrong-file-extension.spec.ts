import { Test, TestingModule } from '@nestjs/testing';
import { StructService } from '../../../../services/struct.service';
import { api } from '../../../../barrels/api';
import { enums } from '../../../../barrels/enums';
import * as fse from 'fs-extra';
import { interfaces } from '../../../../barrels/interfaces';

let pack = '1-yaml';
let funcId = '2-remove-wrong-ext';
let testId = 'e__wrong-file-extension';

let structService: StructService;

beforeEach(async () => {
  let moduleRef: TestingModule = await Test.createTestingModule({
    controllers: [],
    providers: [StructService]
  }).compile();

  structService = moduleRef.get<StructService>(StructService);
});

test(testId, async () => {
  let file2s: interfaces.File2[];
  let errors: interfaces.BmErrorC[];
  try {
    let structId = api.makeStructId();

    await structService.rebuildStruct({
      dir: `src/models/${pack}/data/${funcId}/${testId}`,
      structId: structId,
      projectId: 'p1',
      connections: [],
      weekStart: api.ProjectWeekStartEnum.Monday
    });

    let outFile2s = fse.readFileSync(
      `src/logs/${structId}/${pack}/${funcId}/${enums.LogEnum.File2s.toString()}`
    );

    let outErrors = fse.readFileSync(
      `src/logs/${structId}/${pack}/${funcId}/${enums.LogEnum.Errors.toString()}`
    );

    file2s = ((await api.transformValidString({
      classType: interfaces.File2,
      jsonString: outFile2s.toString(),
      errorMessage: api.ErEnum.M_BLOCKML_WRONG_TEST_TRANSFORM_AND_VALIDATE
    })) as unknown) as interfaces.File2[];

    errors = ((await api.transformValidString({
      classType: interfaces.BmErrorC,
      jsonString: outErrors.toString(),
      errorMessage: api.ErEnum.M_BLOCKML_WRONG_TEST_TRANSFORM_AND_VALIDATE
    })) as unknown) as interfaces.BmErrorC[];
  } catch (e) {
    api.logToConsole(e);
  }

  expect(file2s.length).toBe(4);
  expect(errors.length).toBe(1);
  expect(errors[0].title).toBe(enums.ErTitleEnum.WRONG_FILE_EXTENSION);
});
