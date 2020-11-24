import { api } from '../../../../barrels/api';
import { helper } from '../../../../barrels/helper';
import { enums } from '../../../../barrels/enums';
import { interfaces } from '../../../../barrels/interfaces';
import { prepareTest } from '../../../../functions/prepare-test';
import * as fse from 'fs-extra';

let caller = enums.CallerEnum.YamlBuild;
let func = enums.FuncEnum.MakeLineNumbers;
let testId = 'e__duplicate-parameters';

test(testId, async () => {
  let errors: interfaces.BmErrorC[];
  let filesAny: any[];

  try {
    let {
      structService,
      structId,
      dataDir,
      fromDir,
      toDir
    } = await prepareTest(caller, func, testId);

    await structService.rebuildStruct({
      dir: dataDir,
      structId: structId,
      projectId: 'p1',
      connections: [],
      weekStart: api.ProjectWeekStartEnum.Monday
    });

    errors = await helper.readLog(fromDir, enums.LogTypeEnum.Errors);
    filesAny = await helper.readLog(fromDir, enums.LogTypeEnum.FilesAny);
    fse.copySync(fromDir, toDir);
  } catch (e) {
    api.logToConsole(e);
  }

  // FILE_CONTENT_IS_NOT_YAML caught before DUPLICATE_PARAMETERS
  expect(errors.length).toBe(1);
  expect(filesAny.length).toBe(0);

  expect(errors[0].title).toBe(enums.ErTitleEnum.FILE_CONTENT_IS_NOT_YAML);
});
