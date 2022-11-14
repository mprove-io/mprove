import test from 'ava';
import * as fse from 'fs-extra';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { logToConsoleBlockml } from '~blockml/functions/log-to-console-blockml';
import { prepareTest } from '~blockml/functions/prepare-test';
import { BmError } from '~blockml/models/bm-error';

let caller = enums.CallerEnum.BuildYaml;
let func = enums.FuncEnum.CheckTopUnknownParameters;
let testId = 'e__unexpected-list';

test('1', async t => {
  let errors: BmError[];
  let filesAny: any[];

  let wLogger;

  try {
    let { structService, traceId, structId, dataDir, fromDir, toDir, logger } =
      await prepareTest(caller, func, testId);

    wLogger = logger;

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
    logToConsoleBlockml({
      log: e,
      logLevel: common.LogLevelEnum.Error,
      logger: wLogger
    });
  }

  t.is(errors.length, 1);
  t.is(filesAny.length, 1);

  t.is(errors[0].title, enums.ErTitleEnum.UNEXPECTED_LIST);
  t.is(errors[0].lines[0].line, 2);
});
