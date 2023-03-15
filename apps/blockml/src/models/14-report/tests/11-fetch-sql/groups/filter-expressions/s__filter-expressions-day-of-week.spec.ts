import test from 'ava';
import * as fse from 'fs-extra';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { logToConsoleBlockml } from '~blockml/functions/log-to-console-blockml';
import { prepareTest } from '~blockml/functions/prepare-test';
import { BmError } from '~blockml/models/bm-error';

let caller = common.CallerEnum.BuildDashboardReport;
let func = common.FuncEnum.FetchSql;
let testId = 'groups/filter-expressions/s__filter-expressions-day-of-week';

test('1', async t => {
  let errors: BmError[];
  let entDashboards: common.FileDashboard[];

  let wLogger;
  let configService;

  try {
    let connection: common.ProjectConnection = {
      connectionId: 'c1',
      type: common.ConnectionTypeEnum.BigQuery
    };

    let {
      structService,
      traceId,
      structId,
      dataDir,
      fromDir,
      toDir,
      logger,
      cs
    } = await prepareTest(caller, func, testId, connection);

    wLogger = logger;

    await structService.rebuildStruct({
      traceId: traceId,
      dir: dataDir,
      structId: structId,
      envId: common.PROJECT_ENV_PROD,
      evs: [],
      connections: [connection]
    });

    errors = await helper.readLog(fromDir, common.LogTypeEnum.Errors);
    entDashboards = await helper.readLog(fromDir, common.LogTypeEnum.Entities);
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

  let sql = `#standardSQL
WITH
  derived__v1__a AS (
    SELECT
      1 as d1,
      CURRENT_TIMESTAMP() as d2
  ),
  view__v1__a AS (
    SELECT
      d1 as dim1,
      FORMAT_TIMESTAMP('%A', (d2)) as time1___day_of_week
    FROM derived__v1__a
  ),
  main AS (
    SELECT
      a.dim1 as a_dim1
    FROM view__v1__a as a
    WHERE
      ((UPPER(a.time1___day_of_week) = UPPER('Monday')
      OR UPPER(a.time1___day_of_week) = UPPER('Tuesday')
      OR UPPER(a.time1___day_of_week) = UPPER('Wednesday')
      OR UPPER(a.time1___day_of_week) = UPPER('Thursday')
      OR UPPER(a.time1___day_of_week) = UPPER('Friday')
      OR UPPER(a.time1___day_of_week) = UPPER('Saturday')
      OR UPPER(a.time1___day_of_week) = UPPER('Sunday')
      OR 'any' = 'any')
      AND NOT UPPER(a.time1___day_of_week) = UPPER('Monday')
      AND NOT UPPER(a.time1___day_of_week) = UPPER('Tuesday')
      AND NOT UPPER(a.time1___day_of_week) = UPPER('Wednesday')
      AND NOT UPPER(a.time1___day_of_week) = UPPER('Thursday')
      AND NOT UPPER(a.time1___day_of_week) = UPPER('Friday')
      AND NOT UPPER(a.time1___day_of_week) = UPPER('Saturday')
      AND NOT UPPER(a.time1___day_of_week) = UPPER('Sunday'))
    GROUP BY 1
  )
SELECT
  a_dim1
FROM main
LIMIT 500`;

  t.is(errors.length, 0);
  t.is(entDashboards.length, 1);
  t.is(entDashboards[0].reports[0].sql.join('\n'), sql);
});

test('2', async t => {
  let errors: BmError[];
  let entDashboards: common.FileDashboard[];

  let wLogger;
  let configService;

  try {
    let connection: common.ProjectConnection = {
      connectionId: 'c1',
      type: common.ConnectionTypeEnum.PostgreSQL
    };

    let {
      structService,
      traceId,
      structId,
      dataDir,
      fromDir,
      toDir,
      logger,
      cs
    } = await prepareTest(caller, func, testId, connection);

    wLogger = logger;

    await structService.rebuildStruct({
      traceId: traceId,
      dir: dataDir,
      structId: structId,
      envId: common.PROJECT_ENV_PROD,
      evs: [],
      connections: [connection]
    });

    errors = await helper.readLog(fromDir, common.LogTypeEnum.Errors);
    entDashboards = await helper.readLog(fromDir, common.LogTypeEnum.Entities);
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

  let sql = `WITH
  derived__v1__a AS (
    SELECT
      1 as d1,
      CURRENT_TIMESTAMP() as d2
  ),
  view__v1__a AS (
    SELECT
      d1 as dim1,
      TO_CHAR((d2), 'Day') as time1___day_of_week
    FROM derived__v1__a
  ),
  main AS (
    SELECT
      a.dim1 as a_dim1
    FROM view__v1__a as a
    WHERE
      ((UPPER(a.time1___day_of_week) = UPPER('Monday')
      OR UPPER(a.time1___day_of_week) = UPPER('Tuesday')
      OR UPPER(a.time1___day_of_week) = UPPER('Wednesday')
      OR UPPER(a.time1___day_of_week) = UPPER('Thursday')
      OR UPPER(a.time1___day_of_week) = UPPER('Friday')
      OR UPPER(a.time1___day_of_week) = UPPER('Saturday')
      OR UPPER(a.time1___day_of_week) = UPPER('Sunday')
      OR 'any' = 'any')
      AND NOT UPPER(a.time1___day_of_week) = UPPER('Monday')
      AND NOT UPPER(a.time1___day_of_week) = UPPER('Tuesday')
      AND NOT UPPER(a.time1___day_of_week) = UPPER('Wednesday')
      AND NOT UPPER(a.time1___day_of_week) = UPPER('Thursday')
      AND NOT UPPER(a.time1___day_of_week) = UPPER('Friday')
      AND NOT UPPER(a.time1___day_of_week) = UPPER('Saturday')
      AND NOT UPPER(a.time1___day_of_week) = UPPER('Sunday'))
    GROUP BY 1
  )
SELECT
  a_dim1
FROM main
LIMIT 500`;

  t.is(errors.length, 0);
  t.is(entDashboards.length, 1);
  t.is(entDashboards[0].reports[0].sql.join('\n'), sql);
});
