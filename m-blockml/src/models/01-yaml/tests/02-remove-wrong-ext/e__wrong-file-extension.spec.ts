import { api } from '~/barrels/api';
import { enums } from '~/barrels/enums';
import { interfaces } from '~/barrels/interfaces';
import { helper } from '~/barrels/helper';
import { prepareTest } from '~/functions/prepare-test';
import test from 'ava';
import { BmError } from '~/models/bm-error';
import * as fse from 'fs-extra';

let caller = enums.CallerEnum.BuildYaml;
let func = enums.FuncEnum.RemoveWrongExt;
let testId = 'e__wrong-file-extension';

test('1', async t => {
  let errors: BmError[];
  let file2s: interfaces.File2[];

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

    errors = await helper.readLog(fromDir, enums.LogTypeEnum.Errors);
    file2s = await helper.readLog(fromDir, enums.LogTypeEnum.File2s);
    if (helper.isDefined(toDir)) {
      fse.copySync(fromDir, toDir);
    }
  } catch (e) {
    api.logToConsole(e);
  }

  t.is(errors.length, 1);
  t.is(file2s.length, 4);

  t.is(errors[0].title, enums.ErTitleEnum.WRONG_FILE_EXTENSION);
  t.is(errors[0].lines[0].line, 0);
});
