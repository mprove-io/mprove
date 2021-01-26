import test from 'ava';
import * as fse from 'fs-extra';
import { api } from '~/barrels/api';
import { enums } from '~/barrels/enums';
import { helper } from '~/barrels/helper';
import { interfaces } from '~/barrels/interfaces';
import { prepareTest } from '~/functions/prepare-test';
import { BmError } from '~/models/bm-error';

let caller = enums.CallerEnum.BuildYaml;
let func = enums.FuncEnum.DeduplicateFileNames;
let testId = 'e__duplicate-file-names';

test('1', async t => {
  let errors: BmError[];
  let file3s: interfaces.File3[];

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
    file3s = await helper.readLog(fromDir, enums.LogTypeEnum.File3s);
    if (helper.isDefined(toDir)) {
      fse.copySync(fromDir, toDir);
    }
  } catch (e) {
    api.logToConsole(e);
  }

  t.is(errors.length, 1);
  t.is(file3s.length, 1);

  t.is(errors[0].title, enums.ErTitleEnum.DUPLICATE_FILE_NAMES);
  t.is(errors[0].lines.length, 3);
  t.is(errors[0].lines[0].line, 0);
});
