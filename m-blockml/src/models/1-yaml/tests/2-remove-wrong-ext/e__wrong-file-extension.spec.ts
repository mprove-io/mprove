import { api } from '../../../../barrels/api';
import { enums } from '../../../../barrels/enums';
import { interfaces } from '../../../../barrels/interfaces';
import { helper } from '../../../../barrels/helper';
import { prepareTest } from '../../../../functions/prepare-test';

let pack = enums.PackEnum.Yaml;
let caller = enums.CallerEnum.YamlBuild;
let func = enums.FuncEnum.RemoveWrongExt;
let testId = 'e__wrong-file-extension';

test(testId, async () => {
  let file2s: interfaces.File2[];
  let errors: interfaces.BmErrorC[];

  try {
    let { structService, structId, dataDir, logPath } = await prepareTest({
      pack: pack,
      caller: caller,
      func: func,
      testId: testId
    });

    await structService.rebuildStruct({
      dir: dataDir,
      structId: structId,
      projectId: 'p1',
      connections: [],
      weekStart: api.ProjectWeekStartEnum.Monday
    });

    file2s = await helper.readLog(logPath, enums.LogTypeEnum.File2s);
    errors = await helper.readLog(logPath, enums.LogTypeEnum.Errors);
  } catch (e) {
    api.logToConsole(e);
  }

  expect(file2s.length).toBe(4);
  expect(errors.length).toBe(1);
  expect(errors[0].title).toBe(enums.ErTitleEnum.WRONG_FILE_EXTENSION);
  expect(errors[0].lines[0].line).toBe(0);
});
