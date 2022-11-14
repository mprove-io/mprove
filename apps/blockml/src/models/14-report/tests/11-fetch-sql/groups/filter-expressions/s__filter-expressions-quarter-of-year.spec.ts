import test from 'ava';
import * as fse from 'fs-extra';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { logToConsoleBlockml } from '~blockml/functions/log-to-console-blockml';
import { prepareTest } from '~blockml/functions/prepare-test';
import { BmError } from '~blockml/models/bm-error';

let caller = enums.CallerEnum.BuildDashboardReport;
let func = enums.FuncEnum.FetchSql;
let testId = 'groups/filter-expressions/s__filter-expressions-quarter-of-year';

test('1', async t => {
  let errors: BmError[];
  let entDashboards: interfaces.Dashboard[];

  let wLogger;

  try {
    let connection: common.ProjectConnection = {
      connectionId: 'c1',
      type: common.ConnectionTypeEnum.BigQuery
    };

    let { structService, traceId, structId, dataDir, fromDir, toDir, logger } =
      await prepareTest(caller, func, testId, connection);

    wLogger = logger;

    await structService.rebuildStruct({
      traceId: traceId,
      dir: dataDir,
      structId: structId,
      envId: common.PROJECT_ENV_PROD,
      evs: [],
      connections: [connection]
    });

    errors = await helper.readLog(fromDir, enums.LogTypeEnum.Errors);
    entDashboards = await helper.readLog(fromDir, enums.LogTypeEnum.Entities);
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
      CONCAT(CAST('Q' AS STRING), CAST(EXTRACT(QUARTER FROM (d2)) AS STRING)) as time1___quarter_of_year
    FROM derived__v1__a
  ),
  main AS (
    SELECT
      a.dim1 as a_dim1
    FROM view__v1__a as a
    WHERE
      ((UPPER(a.time1___quarter_of_year) = UPPER('q1')
      OR UPPER(a.time1___quarter_of_year) = UPPER('q2')
      OR UPPER(a.time1___quarter_of_year) = UPPER('q3')
      OR UPPER(a.time1___quarter_of_year) = UPPER('q4')
      OR 'any' = 'any')
      AND NOT UPPER(a.time1___quarter_of_year) = UPPER('q1')
      AND NOT UPPER(a.time1___quarter_of_year) = UPPER('q2')
      AND NOT UPPER(a.time1___quarter_of_year) = UPPER('q3')
      AND NOT UPPER(a.time1___quarter_of_year) = UPPER('q4'))
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
  let entDashboards: interfaces.Dashboard[];

  let wLogger;

  try {
    let connection: common.ProjectConnection = {
      connectionId: 'c1',
      type: common.ConnectionTypeEnum.PostgreSQL
    };

    let { structService, traceId, structId, dataDir, fromDir, toDir, logger } =
      await prepareTest(caller, func, testId, connection);

    wLogger = logger;

    await structService.rebuildStruct({
      traceId: traceId,
      dir: dataDir,
      structId: structId,
      envId: common.PROJECT_ENV_PROD,
      evs: [],
      connections: [connection]
    });

    errors = await helper.readLog(fromDir, enums.LogTypeEnum.Errors);
    entDashboards = await helper.readLog(fromDir, enums.LogTypeEnum.Entities);
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

  let sql = `WITH
  derived__v1__a AS (
    SELECT
      1 as d1,
      CURRENT_TIMESTAMP() as d2
  ),
  view__v1__a AS (
    SELECT
      d1 as dim1,
      CAST('Q' AS VARCHAR) || CAST(EXTRACT(QUARTER FROM (d2))::integer AS VARCHAR) as time1___quarter_of_year
    FROM derived__v1__a
  ),
  main AS (
    SELECT
      a.dim1 as a_dim1
    FROM view__v1__a as a
    WHERE
      ((UPPER(a.time1___quarter_of_year) = UPPER('q1')
      OR UPPER(a.time1___quarter_of_year) = UPPER('q2')
      OR UPPER(a.time1___quarter_of_year) = UPPER('q3')
      OR UPPER(a.time1___quarter_of_year) = UPPER('q4')
      OR 'any' = 'any')
      AND NOT UPPER(a.time1___quarter_of_year) = UPPER('q1')
      AND NOT UPPER(a.time1___quarter_of_year) = UPPER('q2')
      AND NOT UPPER(a.time1___quarter_of_year) = UPPER('q3')
      AND NOT UPPER(a.time1___quarter_of_year) = UPPER('q4'))
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
