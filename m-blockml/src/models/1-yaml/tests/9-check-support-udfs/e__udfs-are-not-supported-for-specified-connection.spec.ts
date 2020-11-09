import { Test, TestingModule } from '@nestjs/testing';
import { StructService } from '../../../../services/struct.service';
import { api } from '../../../../barrels/api';
import { enums } from '../../../../barrels/enums';
import * as fse from 'fs-extra';
import { interfaces } from '../../../../barrels/interfaces';

let pack = '1-yaml';
let funcId = '9-check-support-udfs';
let testId = 'e__udfs-are-not-supported-for-specified-connection';

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

    let connection: api.ProjectConnection = {
      name: 'c1',
      type: api.ConnectionTypeEnum.PostgreSQL
    };

    await structService.rebuildStruct({
      dir: `src/models/${pack}/data/${funcId}/${testId}`,
      structId: structId,
      projectId: 'p1',
      connections: [connection],
      weekStart: api.ProjectWeekStartEnum.Monday
    });

    let outFilesAny = fse.readFileSync(
      `src/logs/${structId}/${pack}/${funcId}/${enums.LogEnum.FilesAny.toString()}`
    );

    let outErrors = fse.readFileSync(
      `src/logs/${structId}/${pack}/${funcId}/${enums.LogEnum.Errors.toString()}`
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

  expect(filesAny.length).toBe(0);
  expect(errors.length).toBe(2);
  expect(errors[0].title).toBe(
    enums.ErTitleEnum.UDFS_ARE_NOT_SUPPORTED_FOR_SPECIFIED_CONNECTION
  );
  expect(errors[1].title).toBe(
    enums.ErTitleEnum.UDFS_ARE_NOT_SUPPORTED_FOR_SPECIFIED_CONNECTION
  );
});
