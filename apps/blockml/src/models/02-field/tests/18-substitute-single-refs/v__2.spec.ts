import test from 'ava';
import * as fse from 'fs-extra';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { logToConsoleBlockml } from '~blockml/functions/log-to-console-blockml';
import { prepareTest } from '~blockml/functions/prepare-test';
import { BmError } from '~blockml/models/bm-error';

let caller = common.CallerEnum.BuildViewField;
let func = common.FuncEnum.SubstituteSingleRefs;
let testId = 'v__2';

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

    errors = await helper.readLog(fromDir, common.LogTypeEnum.Errors);
    entViews = await helper.readLog(fromDir, common.LogTypeEnum.Entities);
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

  t.is(errors.length, 0);
  t.is(entViews.length, 1);

  t.is(entViews[0].fields.length, 18);

  t.is(entViews[0].fields[0].sqlReal, 'd1');

  t.is(
    entViews[0].fields[1].sqlReal,
    "TO_CHAR(DATE_TRUNC('month', mprovetimestampstart(d1) + t1mprovetimestampend), 'YYYY-MM')"
  );
  t.is(
    entViews[0].fields[17].sqlReal,
    "(TO_CHAR(DATE_TRUNC('month', mprovetimestampstart(d1) + t1mprovetimestampend), 'YYYY-MM')) + d2"
  );

  t.deepEqual(entViews[0].fieldsDeps, {
    dim1: {},
    time1___month: { dim1: 8 },
    time1___date: { dim1: 8 },
    time1___date_ts: { dim1: 8 },
    time1___week: { dim1: 8 },
    time1___week_ts: { dim1: 8 },
    time1___month_ts: { dim1: 8 },
    time1___quarter: { dim1: 8 },
    time1___quarter_ts: { dim1: 8 },
    time1___year: { dim1: 8 },
    time1___year_ts: { dim1: 8 },
    time1___time: { dim1: 8 },
    time1___ts: { dim1: 8 },
    time1___hour: { dim1: 8 },
    time1___hour_ts: { dim1: 8 },
    time1___minute: { dim1: 8 },
    time1___minute_ts: { dim1: 8 },
    dim2: { time1___month: 13 }
  });

  t.deepEqual(entViews[0].fieldsDepsAfterSingles, {
    dim1: {},
    time1___month: {},
    time1___date: {},
    time1___date_ts: {},
    time1___week: {},
    time1___week_ts: {},
    time1___month_ts: {},
    time1___quarter: {},
    time1___quarter_ts: {},
    time1___year: {},
    time1___year_ts: {},
    time1___time: {},
    time1___ts: {},
    time1___hour: {},
    time1___hour_ts: {},
    time1___minute: {},
    time1___minute_ts: {},
    dim2: {}
  });
});
