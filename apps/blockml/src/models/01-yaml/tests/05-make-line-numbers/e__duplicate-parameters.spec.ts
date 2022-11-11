import test from 'ava';
import * as fse from 'fs-extra';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { logToConsoleBlockml } from '~blockml/functions/log-to-console-blockml';
import { prepareTest } from '~blockml/functions/prepare-test';
import { BmError } from '~blockml/models/bm-error';

let caller = enums.CallerEnum.BuildYaml;
let func = enums.FuncEnum.MakeLineNumbers;
let testId = 'e__duplicate-parameters';

test('1', async t => {
  let errors: BmError[];
  let filesAny: any[];

  try {
    let { structService, traceId, structId, dataDir, fromDir, toDir } =
      await prepareTest(caller, func, testId);

    await structService.rebuildStruct({
      traceId: traceId,
      dir: dataDir,
      structId: structId,
      envId: common.PROJECT_ENV_PROD,
      evs: [],
      connections: []
    });

    errors = await helper.readLog(fromDir, enums.LogTypeEnum.Errors);
    filesAny = await helper.readLog(fromDir, enums.LogTypeEnum.FilesAny);
    if (common.isDefined(toDir)) {
      fse.copySync(fromDir, toDir);
    }
  } catch (e) {
    logToConsoleBlockml(e);
  }

  // FILE_CONTENT_IS_NOT_YAML caught before DUPLICATE_PARAMETERS
  t.is(errors.length, 1);
  t.is(filesAny.length, 1);

  t.is(errors[0].title, enums.ErTitleEnum.FILE_CONTENT_IS_NOT_YAML);
});
