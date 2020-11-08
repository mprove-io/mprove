import { Test, TestingModule } from '@nestjs/testing';
import { StructService } from '../../../services/struct.service';
import { api } from '../../../barrels/api';
import { enums } from '../../../barrels/enums';
import * as fse from 'fs-extra';
import { interfaces } from '../../../barrels/interfaces';

let pack = '1-yaml';
let funcId = '3-deduplicate-file-names';
let testId = '3-deduplicate-file-names__e__duplicate-file-names';

let structService: StructService;

beforeEach(async () => {
  let moduleRef: TestingModule = await Test.createTestingModule({
    controllers: [],
    providers: [StructService]
  }).compile();

  structService = moduleRef.get<StructService>(StructService);
});

test(testId, async () => {
  let file3s: interfaces.File3[];
  let errors: interfaces.BmErrorC[];
  try {
    let structId = api.makeStructId();

    await structService.rebuildStruct({
      dir: `src/models/${pack}/data/${testId}`,
      structId: structId,
      projectId: 'p1',
      connections: [],
      weekStart: api.ProjectWeekStartEnum.Monday
    });

    let outFile3s = fse.readFileSync(
      `src/logs/${structId}/${pack}/${funcId}/${enums.LogEnum.OutFile3s.toString()}`
    );

    let outErrors = fse.readFileSync(
      `src/logs/${structId}/${pack}/${funcId}/${enums.LogEnum.OutErrors.toString()}`
    );

    file3s = ((await api.transformValidString({
      classType: interfaces.File3,
      jsonString: outFile3s.toString(),
      errorMessage: api.ErEnum.M_BLOCKML_WRONG_TEST_TRANSFORM_AND_VALIDATE
    })) as unknown) as interfaces.File3[];

    errors = ((await api.transformValidString({
      classType: interfaces.BmErrorC,
      jsonString: outErrors.toString(),
      errorMessage: api.ErEnum.M_BLOCKML_WRONG_TEST_TRANSFORM_AND_VALIDATE
    })) as unknown) as interfaces.BmErrorC[];
  } catch (e) {
    api.logToConsole(e);
  }

  expect(file3s.length).toBe(1);
  expect(errors.length).toBe(1);
  expect(errors[0].title).toBe(enums.ErTitleEnum.DUPLICATE_FILE_NAMES);
});
