import test from 'ava';
import * as fse from 'fs-extra';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { prepareTest } from '~blockml/functions/prepare-test';
import { BmError } from '~blockml/models/bm-error';

let caller = enums.CallerEnum.BuildYaml;
let func = enums.FuncEnum.CheckConnections;
let testId = 'e__connection-not-found';

test('1', async t => {
  let errors: BmError[];
  let filesAny: any[];

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
      weekStart: common.ProjectWeekStartEnum.Monday
    });

    errors = await helper.readLog(fromDir, enums.LogTypeEnum.Errors);
    filesAny = await helper.readLog(fromDir, enums.LogTypeEnum.FilesAny);
    if (common.isDefined(toDir)) {
      fse.copySync(fromDir, toDir);
    }
  } catch (e) {
    common.logToConsole(e);
  }

  t.is(errors.length, 2);
  t.is(filesAny.length, 0);

  t.is(errors[0].title, enums.ErTitleEnum.CONNECTION_NOT_FOUND);
  t.is(errors[0].lines[0].line, 2);
  t.is(errors[1].title, enums.ErTitleEnum.CONNECTION_NOT_FOUND);
  t.is(errors[1].lines[0].line, 2);
});
