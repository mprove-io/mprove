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
let testId = 'groups/all/v__1';

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
    SELECT d1, d3, d5, d7
    FROM tab1
  ),
  derived__v1__b AS (
    SELECT d1, d3, d5, d7
    FROM tab1
  ),
  view__v1__a AS (
    SELECT
      (d7) + 8 as dim8
    FROM derived__v1__a
  ),
  view__v2__c AS (
    SELECT
      d1 as dim1
    FROM \`tab2\`
  ),
  view__v1__b AS (
    SELECT
      (d5) + 6 as dim6,
      (d7) + 8 as dim8,
      (FORMAT_TIMESTAMP('%F %H', (d1) + 1)) + 2 as dim2,
      (d3) + 4 as dim4
    FROM derived__v1__b
  ),
  main AS (
    SELECT
      c.dim1 as c_dim1,
      COALESCE(mprove_array_sum(ARRAY_AGG(DISTINCT CONCAT(CONCAT(CAST(((d3) + 4) + mk1 AS STRING), '||'), CAST(((FORMAT_TIMESTAMP('%F %H', (d1) + 1)) + 2) + ms1 AS STRING)))), 0) as mf_mea1,
      COALESCE(mprove_array_sum(ARRAY_AGG(DISTINCT CONCAT(CONCAT(CAST(b.dim4 + mk1 AS STRING), '||'), CAST(b.dim2 + ms1 AS STRING)))), 0) as b_mea1,
      (d5) + 6 as mf_dim6,
      (d7) + 8 as mf_dim8,
      b.dim6 as b_dim6,
      b.dim8 as b_dim8
    FROM view__v1__a as a
    LEFT OUTER JOIN view__v2__c as c ON a.dim8 = c.dim1
    LEFT OUTER JOIN view__v1__b as b ON a.dim8 = b.dim8
    GROUP BY 1, 4, 5, 6, 7
  )
SELECT
  c_dim1,
  ((b_mea1 + b_dim6 + 1) + b_dim8 + 2) + ((mf_mea1 + mf_dim6 + 1) + mf_dim8 + 2) + 3 as mf_calc3
FROM main
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
    SELECT d1, d3, d5, d7
    FROM tab1
  ),
  derived__v1__b AS (
    SELECT d1, d3, d5, d7
    FROM tab1
  ),
  view__v1__a AS (
    SELECT
      (d7) + 8 as dim8
    FROM derived__v1__a
  ),
  view__v2__c AS (
    SELECT
      d1 as dim1
    FROM tab2
  ),
  view__v1__b AS (
    SELECT
      (d5) + 6 as dim6,
      (d7) + 8 as dim8,
      (TO_CHAR(DATE_TRUNC('hour', (d1) + 1), 'YYYY-MM-DD HH24')) + 2 as dim2,
      (d3) + 4 as dim4
    FROM derived__v1__b
  ),
  main AS (
    SELECT
      c.dim1 as c_dim1,
      COALESCE(COALESCE(CAST((SUM(DISTINCT CAST(FLOOR(COALESCE(((TO_CHAR(DATE_TRUNC('hour', (d1) + 1), 'YYYY-MM-DD HH24')) + 2) + ms1, 0)*(1000000*1.0)) AS DECIMAL(38,0)) + CAST(('x' || lpad(LEFT(MD5(CAST(((d3) + 4) + mk1 AS VARCHAR)),15), 16, '0'))::bit(64)::bigint AS DECIMAL(38,0))* 1.0e8 + CAST(('x' || lpad(RIGHT(MD5(CAST(((d3) + 4) + mk1 AS VARCHAR)),15), 16, '0'))::bit(64)::bigint AS DECIMAL(38,0))) - SUM(DISTINCT CAST(('x' || lpad(LEFT(MD5(CAST(((d3) + 4) + mk1 AS VARCHAR)),15), 16, '0'))::bit(64)::bigint AS DECIMAL(38,0))* 1.0e8 + CAST(('x' || lpad(RIGHT(MD5(CAST(((d3) + 4) + mk1 AS VARCHAR)),15), 16, '0'))::bit(64)::bigint AS DECIMAL(38,0)))) AS DOUBLE PRECISION) / CAST((1000000*1.0) AS DOUBLE PRECISION), 0), 0) as mf_mea1,
      COALESCE(COALESCE(CAST((SUM(DISTINCT CAST(FLOOR(COALESCE(b.dim2 + ms1, 0)*(1000000*1.0)) AS DECIMAL(38,0)) + CAST(('x' || lpad(LEFT(MD5(CAST(b.dim4 + mk1 AS VARCHAR)),15), 16, '0'))::bit(64)::bigint AS DECIMAL(38,0))* 1.0e8 + CAST(('x' || lpad(RIGHT(MD5(CAST(b.dim4 + mk1 AS VARCHAR)),15), 16, '0'))::bit(64)::bigint AS DECIMAL(38,0))) - SUM(DISTINCT CAST(('x' || lpad(LEFT(MD5(CAST(b.dim4 + mk1 AS VARCHAR)),15), 16, '0'))::bit(64)::bigint AS DECIMAL(38,0))* 1.0e8 + CAST(('x' || lpad(RIGHT(MD5(CAST(b.dim4 + mk1 AS VARCHAR)),15), 16, '0'))::bit(64)::bigint AS DECIMAL(38,0)))) AS DOUBLE PRECISION) / CAST((1000000*1.0) AS DOUBLE PRECISION), 0), 0) as b_mea1,
      (d5) + 6 as mf_dim6,
      (d7) + 8 as mf_dim8,
      b.dim6 as b_dim6,
      b.dim8 as b_dim8
    FROM view__v1__a as a
    LEFT OUTER JOIN view__v2__c as c ON a.dim8 = c.dim1
    LEFT OUTER JOIN view__v1__b as b ON a.dim8 = b.dim8
    GROUP BY 1, 4, 5, 6, 7
  )
SELECT
  c_dim1,
  ((b_mea1 + b_dim6 + 1) + b_dim8 + 2) + ((mf_mea1 + mf_dim6 + 1) + mf_dim8 + 2) + 3 as mf_calc3
FROM main
LIMIT 500`;

  t.is(errors.length, 0);
  t.is(entDashboards.length, 1);
  t.is(entDashboards[0].reports[0].sql.join('\n'), sql);
});
