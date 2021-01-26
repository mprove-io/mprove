import test from 'ava';
import * as fse from 'fs-extra';
import { api } from '~/barrels/api';
import { enums } from '~/barrels/enums';
import { helper } from '~/barrels/helper';
import { prepareTest } from '~/functions/prepare-test';

let caller = enums.CallerEnum.RebuildStruct;
let func = enums.FuncEnum.CollectFiles;
let testId = 'v__files-length';

test('1', async t => {
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
    if (helper.isDefined(toDir)) {
      fse.copySync(fromDir, toDir);
    }
  } catch (e) {
    api.logToConsole(e);
  }

  t.is(files.length, 5);
});
