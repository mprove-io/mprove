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
let testId = 'groups/sql-always-where/v__sql-always-where-refs-view-dim';

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
    SELECT d1, d3, d5
    FROM tab1
  ),
  view__v1__a AS (
    SELECT
      d5 as dim5,
      (FORMAT_TIMESTAMP('%F %H', (d1) + 1)) + 2 as dim2,
      (d3) + 4 as dim4
    FROM derived__v1__a
  ),
  main AS (
    SELECT
      a.dim5 as a_dim5
    FROM view__v1__a as a
    WHERE
      (a.dim2 + a.dim4 > 100)
    GROUP BY 1
  )
SELECT
  a_dim5
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
    SELECT d1, d3, d5
    FROM tab1
  ),
  view__v1__a AS (
    SELECT
      d5 as dim5,
      (TO_CHAR(DATE_TRUNC('hour', (d1) + 1), 'YYYY-MM-DD HH24')) + 2 as dim2,
      (d3) + 4 as dim4
    FROM derived__v1__a
  ),
  main AS (
    SELECT
      a.dim5 as a_dim5
    FROM view__v1__a as a
    WHERE
      (a.dim2 + a.dim4 > 100)
    GROUP BY 1
  )
SELECT
  a_dim5
FROM main
LIMIT 500`;

  t.is(errors.length, 0);
  t.is(entDashboards.length, 1);
  t.is(entDashboards[0].reports[0].sql.join('\n'), sql);
});
