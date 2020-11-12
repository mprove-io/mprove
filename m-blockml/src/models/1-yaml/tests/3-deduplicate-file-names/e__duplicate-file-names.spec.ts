import { api } from '../../../../barrels/api';
import { helper } from '../../../../barrels/helper';
import { enums } from '../../../../barrels/enums';
import { interfaces } from '../../../../barrels/interfaces';
import { prepareTest } from '../../../../functions/prepare-test';

let pack = enums.PackEnum.Yaml;
let caller = enums.CallerEnum.YamlBuild;
let func = enums.FuncEnum.DeduplicateFileNames;
let testId = 'e__duplicate-file-names';

test(testId, async () => {
  let file3s: interfaces.File3[];
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

    file3s = await helper.readLog(logPath, enums.LogTypeEnum.File3s);
    errors = await helper.readLog(logPath, enums.LogTypeEnum.Errors);
  } catch (e) {
    api.logToConsole(e);
  }

  expect(file3s.length).toBe(1);
  expect(errors.length).toBe(1);
  expect(errors[0].title).toBe(enums.ErTitleEnum.DUPLICATE_FILE_NAMES);
  expect(errors[0].lines.length).toBe(3);
  expect(errors[0].lines[0].line).toBe(0);
});
