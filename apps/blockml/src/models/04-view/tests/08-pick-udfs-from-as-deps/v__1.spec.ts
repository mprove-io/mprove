import test from 'ava';
import * as fse from 'fs-extra';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { logToConsoleBlockml } from '~blockml/functions/log-to-console-blockml';
import { prepareTest } from '~blockml/functions/prepare-test';
import { BmError } from '~blockml/models/bm-error';

let caller = enums.CallerEnum.BuildView;
let func = enums.FuncEnum.PickUdfsFromAsDeps;
let testId = 'v__1';

test('1', async t => {
  let views: interfaces.View[];
  let errors: BmError[];

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

    let connection: common.ProjectConnection = {
      connectionId: 'c1',
      type: common.ConnectionTypeEnum.BigQuery
    };

    await structService.rebuildStruct({
      traceId: traceId,
      dir: dataDir,
      structId: structId,
      envId: common.PROJECT_ENV_PROD,
      evs: [],
      connections: [connection]
    });

    views = await helper.readLog(fromDir, enums.LogTypeEnum.Views);
    errors = await helper.readLog(fromDir, enums.LogTypeEnum.Errors);
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

  t.is(views.length, 2);
  t.is(errors.length, 0);

  t.is(views[0].udfs.length, 1);
  t.is(views[1].udfs.length, 1);
});
