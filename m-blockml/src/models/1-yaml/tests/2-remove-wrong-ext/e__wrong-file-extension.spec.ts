import { api } from '../../../../barrels/api';
import { enums } from '../../../../barrels/enums';
import { interfaces } from '../../../../barrels/interfaces';
import { helper } from '../../../../barrels/helper';
import { prepareTest } from '../../../../functions/prepare-test';
import * as fse from 'fs-extra';

let caller = enums.CallerEnum.YamlBuild;
let func = enums.FuncEnum.RemoveWrongExt;
let testId = 'e__wrong-file-extension';

test(testId, async () => {
  let errors: interfaces.BmErrorC[];
  let file2s: interfaces.File2[];

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
    file2s = await helper.readLog(fromDir, enums.LogTypeEnum.File2s);
    fse.copySync(fromDir, toDir);
  } catch (e) {
    api.logToConsole(e);
  }

  expect(errors.length).toBe(1);
  expect(file2s.length).toBe(4);

  expect(errors[0].title).toBe(enums.ErTitleEnum.WRONG_FILE_EXTENSION);
  expect(errors[0].lines[0].line).toBe(0);
});
