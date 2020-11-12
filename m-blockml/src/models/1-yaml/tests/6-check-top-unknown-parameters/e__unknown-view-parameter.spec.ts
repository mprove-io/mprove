import { api } from '../../../../barrels/api';
import { helper } from '../../../../barrels/helper';
import { enums } from '../../../../barrels/enums';
import { interfaces } from '../../../../barrels/interfaces';
import { prepareTest } from '../../../../functions/prepare-test';

let pack = enums.PackEnum.Yaml;
let caller = enums.CallerEnum.YamlBuild;
let func = enums.FuncEnum.CheckTopUnknownParameters;
let testId = 'e__unknown-view-parameter';

test(testId, async () => {
  let filesAny: any[];
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

    filesAny = await helper.readLog(logPath, enums.LogTypeEnum.FilesAny);
    errors = await helper.readLog(logPath, enums.LogTypeEnum.Errors);
  } catch (e) {
    api.logToConsole(e);
  }

  expect(filesAny.length).toBe(0);
  expect(errors.length).toBe(1);
  expect(errors[0].title).toBe(enums.ErTitleEnum.UNKNOWN_VIEW_PARAMETER);
  expect(errors[0].lines[0].line).toBe(2);
});
