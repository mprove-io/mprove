import { api } from '../../../../barrels/api';
import { enums } from '../../../../barrels/enums';
import { prepareTest } from '../../../../functions/prepare-test';
import { helper } from '../../../../barrels/helper';
import * as fse from 'fs-extra';

let caller = enums.CallerEnum.RebuildStruct;
let func = enums.FuncEnum.CollectFiles;
let testId = 'v__files-length';

test(testId, async () => {
  let files: api.File[];

  try {
    let {
      structService,
      traceId,
      structId,
      dataDir,
      fromDir,
      toDir
    } = await prepareTest(caller, func, testId);

    await structService.rebuildStruct({
      traceId: traceId,
      dir: dataDir,
      structId: structId,
      connections: [],
      weekStart: api.ProjectWeekStartEnum.Monday
    });

    files = await helper.readLog(fromDir, enums.LogTypeEnum.Files);
    fse.copySync(fromDir, toDir);
  } catch (e) {
    api.logToConsole(e);
  }

  expect(files.length).toBe(5);
});