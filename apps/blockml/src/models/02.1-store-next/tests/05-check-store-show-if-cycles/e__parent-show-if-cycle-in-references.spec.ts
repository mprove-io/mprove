import test from 'ava';
import * as fse from 'fs-extra';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { logToConsoleBlockml } from '~blockml/functions/log-to-console-blockml';
import { prepareTest } from '~blockml/functions/prepare-test';
import { BmError } from '~blockml/models/bm-error';

let caller = common.CallerEnum.BuildStoreNext;
let func = common.FuncEnum.CheckStoreShowIfCycles;
let testId = 'e__parent-show-if-cycle-in-references';

test('1', async t => {
  let errors: BmError[];
  let entStores: common.FileView[];

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
      type: common.ConnectionTypeEnum.PostgreSQL
    };

    await structService.rebuildStruct({
      traceId: traceId,
      dir: dataDir,
      structId: structId,
      envId: common.PROJECT_ENV_PROD,
      evs: [],
      connections: [connection],
      overrideTimezone: undefined
    });

    errors = await helper.readLog(fromDir, common.LogTypeEnum.Errors);
    entStores = await helper.readLog(fromDir, common.LogTypeEnum.Stores);
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
  t.is(entStores.length, 0);

  t.is(errors[0].title, common.ErTitleEnum.SHOW_IF_CYCLE_IN_REFERENCES);
  t.is(errors[0].lines.length, 2);
  let firstErrorLinesSorted = errors[0].lines.sort((a, b) =>
    a.line > b.line ? 1 : b.line > a.line ? -1 : 0
  );
  t.is(firstErrorLinesSorted[0].line, 7);
  t.is(firstErrorLinesSorted[1].line, 9);
});
