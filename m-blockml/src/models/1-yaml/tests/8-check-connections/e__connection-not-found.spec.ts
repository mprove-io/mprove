import { api } from '../../../../barrels/api';
import { helper } from '../../../../barrels/helper';
import { enums } from '../../../../barrels/enums';
import { interfaces } from '../../../../barrels/interfaces';

let pack = '1-yaml';
let func = '8-check-connections';
let testId = 'e__connection-not-found';

test(testId, async () => {
  let filesAny: any[];
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

    filesAny = await helper.readLog(logPath, enums.LogEnum.FilesAny);
    errors = await helper.readLog(logPath, enums.LogEnum.Errors);
  } catch (e) {
    api.logToConsole(e);
  }

  expect(filesAny.length).toBe(0);
  expect(errors.length).toBe(2);
  expect(errors[0].title).toBe(enums.ErTitleEnum.CONNECTION_NOT_FOUND);
  expect(errors[0].lines[0].line).toBe(2);
  expect(errors[1].title).toBe(enums.ErTitleEnum.CONNECTION_NOT_FOUND);
  expect(errors[1].lines[0].line).toBe(2);
});
