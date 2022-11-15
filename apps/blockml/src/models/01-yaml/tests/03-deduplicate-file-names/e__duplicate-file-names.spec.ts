import test from 'ava';
import * as fse from 'fs-extra';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { logToConsoleBlockml } from '~blockml/functions/log-to-console-blockml';
import { prepareTest } from '~blockml/functions/prepare-test';
import { BmError } from '~blockml/models/bm-error';

let caller = enums.CallerEnum.BuildYaml;
let func = enums.FuncEnum.DeduplicateFileNames;
let testId = 'e__duplicate-file-names';

test('1', async t => {
  let errors: BmError[];
  let file3s: interfaces.File3[];

  let wLogger;
  let configService;

  try {
    let {
      structService,
      traceId,
      structId,
      dataDir,
      fromDir,
      toDir,
      logger,
      cs
    } = await prepareTest(caller, func, testId);

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
    file3s = await helper.readLog(fromDir, enums.LogTypeEnum.File3s);
    if (common.isDefined(toDir)) {
      fse.copySync(fromDir, toDir);
    }
  } catch (e) {
    logToConsoleBlockml({
      log: e,
      logLevel: common.LogLevelEnum.Error,
      logger: wLogger,
      cs: configService
    });
  }

  t.is(errors.length, 1);
  t.is(file3s.length, 2);

  t.is(errors[0].title, enums.ErTitleEnum.DUPLICATE_FILE_NAMES);
  t.is(errors[0].lines.length, 3);
  t.is(errors[0].lines[0].line, 0);
});
