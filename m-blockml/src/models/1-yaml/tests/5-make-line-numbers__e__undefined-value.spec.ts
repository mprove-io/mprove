import { Test, TestingModule } from '@nestjs/testing';
import { StructService } from '../../../services/struct.service';
import { api } from '../../../barrels/api';
import { enums } from '../../../barrels/enums';
import * as fse from 'fs-extra';
import { interfaces } from '../../../barrels/interfaces';

let pack = '1-yaml';
let funcId = '5-make-line-numbers';
let testId = '5-make-line-numbers__e__undefined-value';

let structService: StructService;

beforeEach(async () => {
  let moduleRef: TestingModule = await Test.createTestingModule({
    controllers: [],
    providers: [StructService]
  }).compile();

  structService = moduleRef.get<StructService>(StructService);
});

test(testId, async () => {
  let filesAny: any[];
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

    let outFilesAny = fse.readFileSync(
      `src/logs/${structId}/${pack}/${funcId}/${enums.LogEnum.OutFilesAny.toString()}`
    );

    let outErrors = fse.readFileSync(
      `src/logs/${structId}/${pack}/${funcId}/${enums.LogEnum.OutErrors.toString()}`
    );

    filesAny = JSON.parse(outFilesAny.toString());

    errors = ((await api.transformValidString({
      classType: interfaces.BmErrorC,
      jsonString: outErrors.toString(),
      errorMessage: api.ErEnum.M_BLOCKML_WRONG_TEST_TRANSFORM_AND_VALIDATE
    })) as unknown) as interfaces.BmErrorC[];
  } catch (e) {
    api.logToConsole(e);
  }

  expect(filesAny.length).toBe(2);
  expect(errors.length).toBe(1);
  expect(errors[0].title).toBe(enums.ErTitleEnum.UNDEFINED_VALUE);
});
