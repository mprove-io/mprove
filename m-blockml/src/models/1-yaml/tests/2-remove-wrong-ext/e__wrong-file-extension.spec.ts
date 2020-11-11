import { api } from '../../../../barrels/api';
import { helper } from '../../../../barrels/helper';
import { enums } from '../../../../barrels/enums';
import { interfaces } from '../../../../barrels/interfaces';

let pack = '1-yaml';
let func = '2-remove-wrong-ext';
let testId = 'e__wrong-file-extension';

test(testId, async () => {
  let file2s: interfaces.File2[];
  let errors: interfaces.BmErrorC[];

  try {
    let {
      structService,
      structId,
      dataDir,
      logPath
    } = await helper.prepareTest(pack, func, testId);

    await structService.rebuildStruct({
      dir: dataDir,
      structId: structId,
      projectId: 'p1',
      connections: [],
      weekStart: api.ProjectWeekStartEnum.Monday
    });

    file2s = await helper.readLog(logPath, enums.LogEnum.File2s);
    errors = await helper.readLog(logPath, enums.LogEnum.Errors);
  } catch (e) {
    api.logToConsole(e);
  }

  expect(file2s.length).toBe(4);
  expect(errors.length).toBe(1);
  expect(errors[0].title).toBe(enums.ErTitleEnum.WRONG_FILE_EXTENSION);
  expect(errors[0].lines[0].line).toBe(0);
});
