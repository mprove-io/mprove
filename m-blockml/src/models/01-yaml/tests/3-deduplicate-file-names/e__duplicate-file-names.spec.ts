import { api } from '../../../../barrels/api';
import { helper } from '../../../../barrels/helper';
import { enums } from '../../../../barrels/enums';
import { interfaces } from '../../../../barrels/interfaces';
import { prepareTest } from '../../../../functions/prepare-test';
import * as fse from 'fs-extra';

let caller = enums.CallerEnum.BuildYaml;
let func = enums.FuncEnum.DeduplicateFileNames;
let testId = 'e__duplicate-file-names';

test(testId, async () => {
  let errors: interfaces.BmErrorC[];
  let file3s: interfaces.File3[];

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
    file3s = await helper.readLog(fromDir, enums.LogTypeEnum.File3s);
    fse.copySync(fromDir, toDir);
  } catch (e) {
    api.logToConsole(e);
  }

  expect(errors.length).toBe(1);
  expect(file3s.length).toBe(1);

  expect(errors[0].title).toBe(enums.ErTitleEnum.DUPLICATE_FILE_NAMES);
  expect(errors[0].lines.length).toBe(3);
  expect(errors[0].lines[0].line).toBe(0);
});
