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
let testId =
  'groups/sql-always-where-calc/v__sql-always-where-calc-refs-model-mea-2';

test('1', async t => {
  let errors: BmError[];
  let entDashboards: interfaces.Dashboard[];

  let pLogger;

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
      pinoLogger
    } = await prepareTest(caller, func, testId, connection);

    pLogger = pinoLogger;

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
      pinoLogger: pLogger
    });
  }

  let sql = `#standardSQL
CREATE TEMPORARY FUNCTION mprove_array_sum(ar ARRAY<STRING>) AS
  ((SELECT SUM(CAST(REGEXP_EXTRACT(val, '\\\\|\\\\|(\\\\-?\\\\d+(?:.\\\\d+)?)$') AS FLOAT64)) FROM UNNEST(ar) as val));
WITH
  derived__v1__a AS (
    SELECT d1, d3, d5
    FROM tab1
  ),
  view__v1__a AS (
    SELECT
      FORMAT_TIMESTAMP('%F %H', (d1) + 1) as time1___hour,
      d3 as dim3
    FROM derived__v1__a
  ),
  main AS (
    SELECT
      d5 as mf_dim5,
      COALESCE(mprove_array_sum(ARRAY_AGG(DISTINCT CONCAT(CONCAT(CAST((a.dim3 + 4) + mk1 AS STRING), '||'), CAST((a.time1___hour + 2) + ms1 AS STRING)))), 0) as mf_mea1
    FROM view__v1__a as a
    GROUP BY 1
  )
SELECT
  mf_dim5
FROM main
WHERE
  (mf_mea1 > 100)
LIMIT 500`;

  t.is(errors.length, 0);
  t.is(entDashboards.length, 1);
  t.is(entDashboards[0].reports[0].sql.join('\n'), sql);
});

test('2', async t => {
  let errors: BmError[];
  let entDashboards: interfaces.Dashboard[];

  let pLogger;

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
      pinoLogger
    } = await prepareTest(caller, func, testId, connection);

    pLogger = pinoLogger;

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
      pinoLogger: pLogger
    });
  }

  let sql = `WITH
  derived__v1__a AS (
    SELECT d1, d3, d5
    FROM tab1
  ),
  view__v1__a AS (
    SELECT
      TO_CHAR(DATE_TRUNC('hour', (d1) + 1), 'YYYY-MM-DD HH24') as time1___hour,
      d3 as dim3
    FROM derived__v1__a
  ),
  main AS (
    SELECT
      d5 as mf_dim5,
      COALESCE(COALESCE(CAST((SUM(DISTINCT CAST(FLOOR(COALESCE((a.time1___hour + 2) + ms1, 0)*(1000000*1.0)) AS DECIMAL(38,0)) + CAST(('x' || lpad(LEFT(MD5(CAST((a.dim3 + 4) + mk1 AS VARCHAR)),15), 16, '0'))::bit(64)::bigint AS DECIMAL(38,0))* 1.0e8 + CAST(('x' || lpad(RIGHT(MD5(CAST((a.dim3 + 4) + mk1 AS VARCHAR)),15), 16, '0'))::bit(64)::bigint AS DECIMAL(38,0))) - SUM(DISTINCT CAST(('x' || lpad(LEFT(MD5(CAST((a.dim3 + 4) + mk1 AS VARCHAR)),15), 16, '0'))::bit(64)::bigint AS DECIMAL(38,0))* 1.0e8 + CAST(('x' || lpad(RIGHT(MD5(CAST((a.dim3 + 4) + mk1 AS VARCHAR)),15), 16, '0'))::bit(64)::bigint AS DECIMAL(38,0)))) AS DOUBLE PRECISION) / CAST((1000000*1.0) AS DOUBLE PRECISION), 0), 0) as mf_mea1
    FROM view__v1__a as a
    GROUP BY 1
  )
SELECT
  mf_dim5
FROM main
WHERE
  (mf_mea1 > 100)
LIMIT 500`;

  t.is(errors.length, 0);
  t.is(entDashboards.length, 1);
  t.is(entDashboards[0].reports[0].sql.join('\n'), sql);
});
