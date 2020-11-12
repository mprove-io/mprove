import { api } from '../../../../barrels/api';
import { enums } from '../../../../barrels/enums';
import { prepareTest } from '../../../../functions/prepare-test';
import { helper } from '../../../../barrels/helper';

let pack = enums.PackEnum.Yaml;
let caller = enums.CallerEnum.RebuildStruct;
let func = enums.FuncEnum.CollectFiles;
let testId = 'v__files-length';

test(testId, async () => {
  let files: api.File[];

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

    files = await helper.readLog(logPath, enums.LogTypeEnum.Files);
  } catch (e) {
    api.logToConsole(e);
  }

  expect(files.length).toBe(5);
});
