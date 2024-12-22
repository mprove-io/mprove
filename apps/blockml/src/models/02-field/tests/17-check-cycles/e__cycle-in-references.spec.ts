import test from 'ava';
import * as fse from 'fs-extra';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { logToConsoleBlockml } from '~blockml/functions/log-to-console-blockml';
import { prepareTest } from '~blockml/functions/prepare-test';
import { BmError } from '~blockml/models/bm-error';

let caller = common.CallerEnum.BuildViewField;
let func = common.FuncEnum.CheckCycles;
let testId = 'e__cycle-in-references';

test('1', async t => {
  let errors: BmError[];
  let entViews: common.FileView[];

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

    entViews = await helper.readLog(fromDir, common.LogTypeEnum.Entities);
    errors = await helper.readLog(fromDir, common.LogTypeEnum.Errors);
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
  t.is(entViews.length, 0);

  t.is(errors[0].title, common.ErTitleEnum.CYCLE_IN_REFERENCES);
  t.is(errors[0].lines.length, 3);
  t.is(errors[0].lines[0].line, 5);
  t.is(errors[0].lines[1].line, 8);
  t.is(errors[0].lines[2].line, 11);
});
