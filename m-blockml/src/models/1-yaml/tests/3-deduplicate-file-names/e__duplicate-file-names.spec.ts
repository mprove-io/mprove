import { api } from '../../../../barrels/api';
import { helper } from '../../../../barrels/helper';
import { enums } from '../../../../barrels/enums';
import { interfaces } from '../../../../barrels/interfaces';
import { prepareTest } from '../../../../functions/prepare-test';

let pack = '1-yaml';
let func = '3-deduplicate-file-names';
let testId = 'e__duplicate-file-names';

test(testId, async () => {
  let file3s: interfaces.File3[];
  let errors: interfaces.BmErrorC[];

  try {
    let { structService, structId, dataDir, logPath } = await prepareTest(
      pack,
      func,
      testId
    );

    await structService.rebuildStruct({
      dir: dataDir,
      structId: structId,
      projectId: 'p1',
      connections: [],
      weekStart: api.ProjectWeekStartEnum.Monday
    });

    file3s = await helper.readLog(logPath, enums.LogEnum.File3s);
    errors = await helper.readLog(logPath, enums.LogEnum.Errors);
  } catch (e) {
    api.logToConsole(e);
  }

  expect(file3s.length).toBe(1);
  expect(errors.length).toBe(1);
  expect(errors[0].title).toBe(enums.ErTitleEnum.DUPLICATE_FILE_NAMES);
  expect(errors[0].lines.length).toBe(3);
  expect(errors[0].lines[0].line).toBe(0);
});
