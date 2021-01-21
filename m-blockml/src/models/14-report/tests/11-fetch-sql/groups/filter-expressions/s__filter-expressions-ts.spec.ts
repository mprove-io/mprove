import { api } from '../../../../../../barrels/api';
import { enums } from '../../../../../../barrels/enums';
import { interfaces } from '../../../../../../barrels/interfaces';
import { helper } from '../../../../../../barrels/helper';
import { prepareTest } from '../../../../../../functions/prepare-test';
import test from 'ava';
import { BmError } from '../../../../../../models/bm-error';
import * as fse from 'fs-extra';

let caller = enums.CallerEnum.BuildDashboardReport;
let func = enums.FuncEnum.FetchSql;
let testId = 'groups/filter-expressions/s__filter-expressions-ts';

test('1', async t => {
  let errors: BmError[];
  let entDashboards: interfaces.Dashboard[];

  try {
    let connection: api.ProjectConnection = {
      name: 'c1',
      type: api.ConnectionTypeEnum.BigQuery
    };

    let {
      structService,
      traceId,
      structId,
      dataDir,
      fromDir,
      toDir
    } = await prepareTest(caller, func, testId, connection);

    await structService.rebuildStruct({
      traceId: traceId,
      dir: dataDir,
      structId: structId,
      connections: [connection],
      weekStart: api.ProjectWeekStartEnum.Monday
    });

    errors = await helper.readLog(fromDir, enums.LogTypeEnum.Errors);
    entDashboards = await helper.readLog(fromDir, enums.LogTypeEnum.Entities);
    if (helper.isDefined(toDir)) {
      fse.copySync(fromDir, toDir);
    }
  } catch (e) {
    api.logToConsole(e);
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
      TIMESTAMP(FORMAT_TIMESTAMP('%F %T', (d2), 'America/Adak')) as time1___timestamp,
      d1 as dim1,
      FORMAT_TIMESTAMP('%F %T', TIMESTAMP(FORMAT_TIMESTAMP('%F %T', (d2), 'America/Adak'))) as time1___time
    FROM derived__v1__a
  ),
  main AS (
    SELECT
      a.dim1 as a_dim1
    FROM view__v1__a as a
    WHERE
      (((a.time1___timestamp >= TIMESTAMP('2016-07-16 10:52:00') AND a.time1___timestamp < TIMESTAMP_ADD(TIMESTAMP('2016-07-16 10:52:00'), INTERVAL 1 MINUTE))
      OR (a.time1___timestamp >= TIMESTAMP('2016-07-16 10:00:00') AND a.time1___timestamp < TIMESTAMP_ADD(TIMESTAMP('2016-07-16 10:00:00'), INTERVAL 1 HOUR))
      OR (a.time1___timestamp >= TIMESTAMP('2016-07-16') AND a.time1___timestamp < CAST(DATE_ADD(CAST(TIMESTAMP('2016-07-16') AS DATE), INTERVAL 1 DAY) AS TIMESTAMP))
      OR (a.time1___timestamp >= TIMESTAMP('2016-07-01') AND a.time1___timestamp < CAST(DATE_ADD(CAST(TIMESTAMP('2016-07-01') AS DATE), INTERVAL 1 MONTH) AS TIMESTAMP))
      OR (a.time1___timestamp >= TIMESTAMP('2016-01-01') AND a.time1___timestamp < CAST(DATE_ADD(CAST(TIMESTAMP('2016-01-01') AS DATE), INTERVAL 1 YEAR) AS TIMESTAMP))
      OR (a.time1___timestamp >= TIMESTAMP('2016-07-16 10:52:00') AND a.time1___timestamp < TIMESTAMP('2017-08-22 17:32:00'))
      OR (a.time1___timestamp >= TIMESTAMP('2016-07-16 10:00:00') AND a.time1___timestamp < TIMESTAMP('2017-08-22 17:00:00'))
      OR (a.time1___timestamp >= TIMESTAMP('2016-07-16') AND a.time1___timestamp < TIMESTAMP('2017-08-22'))
      OR (a.time1___timestamp >= TIMESTAMP('2016-07-01') AND a.time1___timestamp < TIMESTAMP('2017-08-01'))
      OR (a.time1___timestamp >= TIMESTAMP('2016-01-01') AND a.time1___timestamp < TIMESTAMP('2017-01-01'))
      OR (a.time1___timestamp < TIMESTAMP('2016-07-16 10:52:00'))
      OR (a.time1___timestamp < TIMESTAMP('2016-07-16 10:00:00'))
      OR (a.time1___timestamp < TIMESTAMP('2016-07-16'))
      OR (a.time1___timestamp < TIMESTAMP('2016-07-01'))
      OR (a.time1___timestamp < TIMESTAMP('2016-01-01'))
      OR (a.time1___timestamp < TIMESTAMP('2016-07-16 10:52:00') AND a.time1___timestamp >= CAST(DATE_ADD(CAST(TIMESTAMP('2016-07-16 10:52:00') AS DATE), INTERVAL -2 YEAR) AS TIMESTAMP))
      OR (a.time1___timestamp < TIMESTAMP('2016-07-16 10:00:00') AND a.time1___timestamp >= CAST(DATE_ADD(CAST(TIMESTAMP('2016-07-16 10:00:00') AS DATE), INTERVAL -2 QUARTER) AS TIMESTAMP))
      OR (a.time1___timestamp < TIMESTAMP('2016-07-16') AND a.time1___timestamp >= CAST(DATE_ADD(CAST(TIMESTAMP('2016-07-16') AS DATE), INTERVAL -2 MONTH) AS TIMESTAMP))
      OR (a.time1___timestamp < TIMESTAMP('2016-07-01') AND a.time1___timestamp >= CAST(DATE_ADD(CAST(TIMESTAMP('2016-07-01') AS DATE), INTERVAL -2*7 DAY) AS TIMESTAMP))
      OR (a.time1___timestamp < TIMESTAMP('2016-01-01') AND a.time1___timestamp >= CAST(DATE_ADD(CAST(TIMESTAMP('2016-01-01') AS DATE), INTERVAL -2 DAY) AS TIMESTAMP))
      OR (a.time1___timestamp < CAST(DATE_ADD(CAST(TIMESTAMP(FORMAT_TIMESTAMP('%F %T', CURRENT_TIMESTAMP(), 'America/Adak')) AS DATE), INTERVAL -5 YEAR) AS TIMESTAMP))
      OR (a.time1___timestamp < CAST(DATE_ADD(CAST(TIMESTAMP_TRUNC(TIMESTAMP(FORMAT_TIMESTAMP('%F %T', CURRENT_TIMESTAMP(), 'America/Adak')), QUARTER) AS DATE), INTERVAL -5 QUARTER) AS TIMESTAMP))
      OR (a.time1___timestamp < CAST(DATE_ADD(CAST(TIMESTAMP(FORMAT_TIMESTAMP('%F %T', CURRENT_TIMESTAMP(), 'America/Adak')) AS DATE), INTERVAL 5 MONTH) AS TIMESTAMP))
      OR (a.time1___timestamp < TIMESTAMP_ADD(TIMESTAMP_ADD(TIMESTAMP_TRUNC(TIMESTAMP(FORMAT_TIMESTAMP('%F %T', CURRENT_TIMESTAMP(), 'America/Adak')), WEEK), INTERVAL 1 DAY), INTERVAL 5*7 + 1*7 DAY))
      OR (a.time1___timestamp < TIMESTAMP_ADD(TIMESTAMP(FORMAT_TIMESTAMP('%F %T', CURRENT_TIMESTAMP(), 'America/Adak')), INTERVAL -5 DAY) AND a.time1___timestamp >= TIMESTAMP_ADD(TIMESTAMP_ADD(TIMESTAMP(FORMAT_TIMESTAMP('%F %T', CURRENT_TIMESTAMP(), 'America/Adak')), INTERVAL -5 DAY), INTERVAL -2 HOUR))
      OR (a.time1___timestamp < TIMESTAMP_ADD(TIMESTAMP_TRUNC(TIMESTAMP(FORMAT_TIMESTAMP('%F %T', CURRENT_TIMESTAMP(), 'America/Adak')), HOUR), INTERVAL -5 HOUR) AND a.time1___timestamp >= TIMESTAMP_ADD(TIMESTAMP_ADD(TIMESTAMP_TRUNC(TIMESTAMP(FORMAT_TIMESTAMP('%F %T', CURRENT_TIMESTAMP(), 'America/Adak')), HOUR), INTERVAL -5 HOUR), INTERVAL -2 MINUTE))
      OR (a.time1___timestamp < TIMESTAMP_ADD(TIMESTAMP(FORMAT_TIMESTAMP('%F %T', CURRENT_TIMESTAMP(), 'America/Adak')), INTERVAL 5 MINUTE) AND a.time1___timestamp >= TIMESTAMP_ADD(TIMESTAMP_ADD(TIMESTAMP(FORMAT_TIMESTAMP('%F %T', CURRENT_TIMESTAMP(), 'America/Adak')), INTERVAL 5 MINUTE), INTERVAL -2 MINUTE))
      OR (a.time1___timestamp < TIMESTAMP_ADD(TIMESTAMP_TRUNC(TIMESTAMP(FORMAT_TIMESTAMP('%F %T', CURRENT_TIMESTAMP(), 'America/Adak')), MINUTE), INTERVAL 5 + 1 MINUTE) AND a.time1___timestamp >= TIMESTAMP_ADD(TIMESTAMP_ADD(TIMESTAMP_TRUNC(TIMESTAMP(FORMAT_TIMESTAMP('%F %T', CURRENT_TIMESTAMP(), 'America/Adak')), MINUTE), INTERVAL 5 + 1 MINUTE), INTERVAL -2 MINUTE))
      OR (a.time1___timestamp >= TIMESTAMP('2016-07-16 10:52:00'))
      OR (a.time1___timestamp >= TIMESTAMP('2016-07-16 10:00:00'))
      OR (a.time1___timestamp >= TIMESTAMP('2016-07-16'))
      OR (a.time1___timestamp >= TIMESTAMP('2016-07-01'))
      OR (a.time1___timestamp >= TIMESTAMP('2016-01-01'))
      OR (a.time1___timestamp >= TIMESTAMP('2016-07-16 10:52:00') AND a.time1___timestamp < CAST(DATE_ADD(CAST(TIMESTAMP('2016-07-16 10:52:00') AS DATE), INTERVAL 2 YEAR) AS TIMESTAMP))
      OR (a.time1___timestamp >= TIMESTAMP('2016-07-16 10:00:00') AND a.time1___timestamp < CAST(DATE_ADD(CAST(TIMESTAMP('2016-07-16 10:00:00') AS DATE), INTERVAL 2 QUARTER) AS TIMESTAMP))
      OR (a.time1___timestamp >= TIMESTAMP('2016-07-16') AND a.time1___timestamp < CAST(DATE_ADD(CAST(TIMESTAMP('2016-07-16') AS DATE), INTERVAL 2 MONTH) AS TIMESTAMP))
      OR (a.time1___timestamp >= TIMESTAMP('2016-07-01') AND a.time1___timestamp < CAST(DATE_ADD(CAST(TIMESTAMP('2016-07-01') AS DATE), INTERVAL 2*7 DAY) AS TIMESTAMP))
      OR (a.time1___timestamp >= TIMESTAMP('2016-01-01') AND a.time1___timestamp < CAST(DATE_ADD(CAST(TIMESTAMP('2016-01-01') AS DATE), INTERVAL 2 DAY) AS TIMESTAMP))
      OR (a.time1___timestamp >= CAST(DATE_ADD(CAST(TIMESTAMP(FORMAT_TIMESTAMP('%F %T', CURRENT_TIMESTAMP(), 'America/Adak')) AS DATE), INTERVAL -5 YEAR) AS TIMESTAMP))
      OR (a.time1___timestamp >= CAST(DATE_ADD(CAST(TIMESTAMP_TRUNC(TIMESTAMP(FORMAT_TIMESTAMP('%F %T', CURRENT_TIMESTAMP(), 'America/Adak')), QUARTER) AS DATE), INTERVAL -5 QUARTER) AS TIMESTAMP))
      OR (a.time1___timestamp >= CAST(DATE_ADD(CAST(TIMESTAMP(FORMAT_TIMESTAMP('%F %T', CURRENT_TIMESTAMP(), 'America/Adak')) AS DATE), INTERVAL 5 MONTH) AS TIMESTAMP))
      OR (a.time1___timestamp >= TIMESTAMP_ADD(TIMESTAMP_ADD(TIMESTAMP_TRUNC(TIMESTAMP(FORMAT_TIMESTAMP('%F %T', CURRENT_TIMESTAMP(), 'America/Adak')), WEEK), INTERVAL 1 DAY), INTERVAL 5*7 + 1*7 DAY))
      OR (a.time1___timestamp >= TIMESTAMP_ADD(TIMESTAMP(FORMAT_TIMESTAMP('%F %T', CURRENT_TIMESTAMP(), 'America/Adak')), INTERVAL -5 DAY) AND a.time1___timestamp < TIMESTAMP_ADD(TIMESTAMP_ADD(TIMESTAMP(FORMAT_TIMESTAMP('%F %T', CURRENT_TIMESTAMP(), 'America/Adak')), INTERVAL -5 DAY), INTERVAL 2 HOUR))
      OR (a.time1___timestamp >= TIMESTAMP_ADD(TIMESTAMP_TRUNC(TIMESTAMP(FORMAT_TIMESTAMP('%F %T', CURRENT_TIMESTAMP(), 'America/Adak')), HOUR), INTERVAL -5 HOUR) AND a.time1___timestamp < TIMESTAMP_ADD(TIMESTAMP_ADD(TIMESTAMP_TRUNC(TIMESTAMP(FORMAT_TIMESTAMP('%F %T', CURRENT_TIMESTAMP(), 'America/Adak')), HOUR), INTERVAL -5 HOUR), INTERVAL 2 MINUTE))
      OR (a.time1___timestamp >= TIMESTAMP_ADD(TIMESTAMP(FORMAT_TIMESTAMP('%F %T', CURRENT_TIMESTAMP(), 'America/Adak')), INTERVAL 5 MINUTE) AND a.time1___timestamp < TIMESTAMP_ADD(TIMESTAMP_ADD(TIMESTAMP(FORMAT_TIMESTAMP('%F %T', CURRENT_TIMESTAMP(), 'America/Adak')), INTERVAL 5 MINUTE), INTERVAL 2 MINUTE))
      OR (a.time1___timestamp >= TIMESTAMP_ADD(TIMESTAMP_TRUNC(TIMESTAMP(FORMAT_TIMESTAMP('%F %T', CURRENT_TIMESTAMP(), 'America/Adak')), MINUTE), INTERVAL 5 + 1 MINUTE) AND a.time1___timestamp < TIMESTAMP_ADD(TIMESTAMP_ADD(TIMESTAMP_TRUNC(TIMESTAMP(FORMAT_TIMESTAMP('%F %T', CURRENT_TIMESTAMP(), 'America/Adak')), MINUTE), INTERVAL 5 + 1 MINUTE), INTERVAL 2 MINUTE))
      OR (a.time1___timestamp >= TIMESTAMP_ADD(TIMESTAMP(FORMAT_TIMESTAMP('%F %T', CURRENT_TIMESTAMP(), 'America/Adak')), INTERVAL -5 DAY) AND a.time1___timestamp < TIMESTAMP(FORMAT_TIMESTAMP('%F %T', CURRENT_TIMESTAMP(), 'America/Adak')))
      OR (a.time1___timestamp >= TIMESTAMP_ADD(TIMESTAMP_TRUNC(TIMESTAMP(FORMAT_TIMESTAMP('%F %T', CURRENT_TIMESTAMP(), 'America/Adak')), DAY), INTERVAL -5 DAY) AND a.time1___timestamp < TIMESTAMP_TRUNC(TIMESTAMP(FORMAT_TIMESTAMP('%F %T', CURRENT_TIMESTAMP(), 'America/Adak')), DAY))
      OR (a.time1___timestamp >= TIMESTAMP_ADD(TIMESTAMP_TRUNC(TIMESTAMP(FORMAT_TIMESTAMP('%F %T', CURRENT_TIMESTAMP(), 'America/Adak')), DAY), INTERVAL -5 DAY) AND a.time1___timestamp < TIMESTAMP_ADD(TIMESTAMP_TRUNC(TIMESTAMP(FORMAT_TIMESTAMP('%F %T', CURRENT_TIMESTAMP(), 'America/Adak')), DAY), INTERVAL 1 DAY))
      OR (a.time1___timestamp IS NULL)
      OR 'any' = 'any')
      AND NOT (a.time1___timestamp IS NULL))
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

  try {
    let connection: api.ProjectConnection = {
      name: 'c1',
      type: api.ConnectionTypeEnum.PostgreSQL
    };

    let {
      structService,
      traceId,
      structId,
      dataDir,
      fromDir,
      toDir
    } = await prepareTest(caller, func, testId, connection);

    await structService.rebuildStruct({
      traceId: traceId,
      dir: dataDir,
      structId: structId,
      connections: [connection],
      weekStart: api.ProjectWeekStartEnum.Monday
    });

    errors = await helper.readLog(fromDir, enums.LogTypeEnum.Errors);
    entDashboards = await helper.readLog(fromDir, enums.LogTypeEnum.Entities);
    if (helper.isDefined(toDir)) {
      fse.copySync(fromDir, toDir);
    }
  } catch (e) {
    api.logToConsole(e);
  }

  let sql = `WITH
  derived__v1__a AS (
    SELECT
      1 as d1,
      CURRENT_TIMESTAMP() as d2
  ),
  view__v1__a AS (
    SELECT
      TIMEZONE('America/Adak', (d2)::TIMESTAMPTZ) as time1___timestamp,
      d1 as dim1,
      TO_CHAR(TIMEZONE('America/Adak', (d2)::TIMESTAMPTZ), 'YYYY-MM-DD HH24:MI:SS') as time1___time
    FROM derived__v1__a
  ),
  main AS (
    SELECT
      a.dim1 as a_dim1
    FROM view__v1__a as a
    WHERE
      (((a.time1___timestamp >= '2016-07-16 10:52:00'::TIMESTAMP AND a.time1___timestamp < '2016-07-16 10:52:00'::TIMESTAMP + INTERVAL '1 minute')
      OR (a.time1___timestamp >= '2016-07-16 10:00:00'::TIMESTAMP AND a.time1___timestamp < '2016-07-16 10:00:00'::TIMESTAMP + INTERVAL '1 hour')
      OR (a.time1___timestamp >= '2016-07-16'::TIMESTAMP AND a.time1___timestamp < '2016-07-16'::TIMESTAMP + INTERVAL '1 day')
      OR (a.time1___timestamp >= '2016-07-01'::TIMESTAMP AND a.time1___timestamp < '2016-07-01'::TIMESTAMP + INTERVAL '1 month')
      OR (a.time1___timestamp >= '2016-01-01'::TIMESTAMP AND a.time1___timestamp < '2016-01-01'::TIMESTAMP + INTERVAL '1 year')
      OR (a.time1___timestamp >= '2016-07-16 10:52:00'::TIMESTAMP AND a.time1___timestamp < '2017-08-22 17:32:00'::TIMESTAMP)
      OR (a.time1___timestamp >= '2016-07-16 10:00:00'::TIMESTAMP AND a.time1___timestamp < '2017-08-22 17:00:00'::TIMESTAMP)
      OR (a.time1___timestamp >= '2016-07-16'::TIMESTAMP AND a.time1___timestamp < '2017-08-22'::TIMESTAMP)
      OR (a.time1___timestamp >= '2016-07-01'::TIMESTAMP AND a.time1___timestamp < '2017-08-01'::TIMESTAMP)
      OR (a.time1___timestamp >= '2016-01-01'::TIMESTAMP AND a.time1___timestamp < '2017-01-01'::TIMESTAMP)
      OR (a.time1___timestamp < '2016-07-16 10:52:00'::TIMESTAMP)
      OR (a.time1___timestamp < '2016-07-16 10:00:00'::TIMESTAMP)
      OR (a.time1___timestamp < '2016-07-16'::TIMESTAMP)
      OR (a.time1___timestamp < '2016-07-01'::TIMESTAMP)
      OR (a.time1___timestamp < '2016-01-01'::TIMESTAMP)
      OR (a.time1___timestamp < '2016-07-16 10:52:00'::TIMESTAMP AND a.time1___timestamp >= '2016-07-16 10:52:00'::TIMESTAMP + INTERVAL '-2 year')
      OR (a.time1___timestamp < '2016-07-16 10:00:00'::TIMESTAMP AND a.time1___timestamp >= '2016-07-16 10:00:00'::TIMESTAMP + INTERVAL '-6 month')
      OR (a.time1___timestamp < '2016-07-16'::TIMESTAMP AND a.time1___timestamp >= '2016-07-16'::TIMESTAMP + INTERVAL '-2 month')
      OR (a.time1___timestamp < '2016-07-01'::TIMESTAMP AND a.time1___timestamp >= '2016-07-01'::TIMESTAMP + INTERVAL '-14 day')
      OR (a.time1___timestamp < '2016-01-01'::TIMESTAMP AND a.time1___timestamp >= '2016-01-01'::TIMESTAMP + INTERVAL '-2 day')
      OR (a.time1___timestamp < TIMEZONE('America/Adak', CURRENT_TIMESTAMP::TIMESTAMPTZ) + INTERVAL '-5 year')
      OR (a.time1___timestamp < DATE_TRUNC('quarter', TIMEZONE('America/Adak', CURRENT_TIMESTAMP::TIMESTAMPTZ)) + INTERVAL '-15 month')
      OR (a.time1___timestamp < TIMEZONE('America/Adak', CURRENT_TIMESTAMP::TIMESTAMPTZ) + INTERVAL '5 month')
      OR (a.time1___timestamp < DATE_TRUNC('week', TIMEZONE('America/Adak', CURRENT_TIMESTAMP::TIMESTAMPTZ)) + INTERVAL '42 day')
      OR (a.time1___timestamp < TIMEZONE('America/Adak', CURRENT_TIMESTAMP::TIMESTAMPTZ) + INTERVAL '-5 day' AND a.time1___timestamp >= TIMEZONE('America/Adak', CURRENT_TIMESTAMP::TIMESTAMPTZ) + INTERVAL '-5 day' + INTERVAL '-2 hour')
      OR (a.time1___timestamp < DATE_TRUNC('hour', TIMEZONE('America/Adak', CURRENT_TIMESTAMP::TIMESTAMPTZ)) + INTERVAL '-5 hour' AND a.time1___timestamp >= DATE_TRUNC('hour', TIMEZONE('America/Adak', CURRENT_TIMESTAMP::TIMESTAMPTZ)) + INTERVAL '-5 hour' + INTERVAL '-2 minute')
      OR (a.time1___timestamp < TIMEZONE('America/Adak', CURRENT_TIMESTAMP::TIMESTAMPTZ) + INTERVAL '5 minute' AND a.time1___timestamp >= TIMEZONE('America/Adak', CURRENT_TIMESTAMP::TIMESTAMPTZ) + INTERVAL '5 minute' + INTERVAL '-2 minute')
      OR (a.time1___timestamp < DATE_TRUNC('minute', TIMEZONE('America/Adak', CURRENT_TIMESTAMP::TIMESTAMPTZ)) + INTERVAL '6 minute' AND a.time1___timestamp >= DATE_TRUNC('minute', TIMEZONE('America/Adak', CURRENT_TIMESTAMP::TIMESTAMPTZ)) + INTERVAL '6 minute' + INTERVAL '-2 minute')
      OR (a.time1___timestamp >= '2016-07-16 10:52:00'::TIMESTAMP)
      OR (a.time1___timestamp >= '2016-07-16 10:00:00'::TIMESTAMP)
      OR (a.time1___timestamp >= '2016-07-16'::TIMESTAMP)
      OR (a.time1___timestamp >= '2016-07-01'::TIMESTAMP)
      OR (a.time1___timestamp >= '2016-01-01'::TIMESTAMP)
      OR (a.time1___timestamp >= '2016-07-16 10:52:00'::TIMESTAMP AND a.time1___timestamp < '2016-07-16 10:52:00'::TIMESTAMP + INTERVAL '2 year')
      OR (a.time1___timestamp >= '2016-07-16 10:00:00'::TIMESTAMP AND a.time1___timestamp < '2016-07-16 10:00:00'::TIMESTAMP + INTERVAL '6 month')
      OR (a.time1___timestamp >= '2016-07-16'::TIMESTAMP AND a.time1___timestamp < '2016-07-16'::TIMESTAMP + INTERVAL '2 month')
      OR (a.time1___timestamp >= '2016-07-01'::TIMESTAMP AND a.time1___timestamp < '2016-07-01'::TIMESTAMP + INTERVAL '14 day')
      OR (a.time1___timestamp >= '2016-01-01'::TIMESTAMP AND a.time1___timestamp < '2016-01-01'::TIMESTAMP + INTERVAL '2 day')
      OR (a.time1___timestamp >= TIMEZONE('America/Adak', CURRENT_TIMESTAMP::TIMESTAMPTZ) + INTERVAL '-5 year')
      OR (a.time1___timestamp >= DATE_TRUNC('quarter', TIMEZONE('America/Adak', CURRENT_TIMESTAMP::TIMESTAMPTZ)) + INTERVAL '-15 month')
      OR (a.time1___timestamp >= TIMEZONE('America/Adak', CURRENT_TIMESTAMP::TIMESTAMPTZ) + INTERVAL '5 month')
      OR (a.time1___timestamp >= DATE_TRUNC('week', TIMEZONE('America/Adak', CURRENT_TIMESTAMP::TIMESTAMPTZ)) + INTERVAL '42 day')
      OR (a.time1___timestamp >= TIMEZONE('America/Adak', CURRENT_TIMESTAMP::TIMESTAMPTZ) + INTERVAL '-5 day' AND a.time1___timestamp < TIMEZONE('America/Adak', CURRENT_TIMESTAMP::TIMESTAMPTZ) + INTERVAL '-5 day' + INTERVAL '2 hour')
      OR (a.time1___timestamp >= DATE_TRUNC('hour', TIMEZONE('America/Adak', CURRENT_TIMESTAMP::TIMESTAMPTZ)) + INTERVAL '-5 hour' AND a.time1___timestamp < DATE_TRUNC('hour', TIMEZONE('America/Adak', CURRENT_TIMESTAMP::TIMESTAMPTZ)) + INTERVAL '-5 hour' + INTERVAL '2 minute')
      OR (a.time1___timestamp >= TIMEZONE('America/Adak', CURRENT_TIMESTAMP::TIMESTAMPTZ) + INTERVAL '5 minute' AND a.time1___timestamp < TIMEZONE('America/Adak', CURRENT_TIMESTAMP::TIMESTAMPTZ) + INTERVAL '5 minute' + INTERVAL '2 minute')
      OR (a.time1___timestamp >= DATE_TRUNC('minute', TIMEZONE('America/Adak', CURRENT_TIMESTAMP::TIMESTAMPTZ)) + INTERVAL '6 minute' AND a.time1___timestamp < DATE_TRUNC('minute', TIMEZONE('America/Adak', CURRENT_TIMESTAMP::TIMESTAMPTZ)) + INTERVAL '6 minute' + INTERVAL '2 minute')
      OR (a.time1___timestamp >= TIMEZONE('America/Adak', CURRENT_TIMESTAMP::TIMESTAMPTZ) + INTERVAL '-5 day' AND a.time1___timestamp < TIMEZONE('America/Adak', CURRENT_TIMESTAMP::TIMESTAMPTZ))
      OR (a.time1___timestamp >= DATE_TRUNC('day', TIMEZONE('America/Adak', CURRENT_TIMESTAMP::TIMESTAMPTZ)) + INTERVAL '-5 day' AND a.time1___timestamp < DATE_TRUNC('day', TIMEZONE('America/Adak', CURRENT_TIMESTAMP::TIMESTAMPTZ)))
      OR (a.time1___timestamp >= DATE_TRUNC('day', TIMEZONE('America/Adak', CURRENT_TIMESTAMP::TIMESTAMPTZ)) + INTERVAL '-5 day' AND a.time1___timestamp < DATE_TRUNC('day', TIMEZONE('America/Adak', CURRENT_TIMESTAMP::TIMESTAMPTZ)) + INTERVAL '1 day')
      OR (a.time1___timestamp IS NULL)
      OR 'any' = 'any')
      AND NOT (a.time1___timestamp IS NULL))
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
