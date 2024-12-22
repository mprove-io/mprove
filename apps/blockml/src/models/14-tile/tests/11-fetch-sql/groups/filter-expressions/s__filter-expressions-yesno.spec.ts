import test from 'ava';
import * as fse from 'fs-extra';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { logToConsoleBlockml } from '~blockml/functions/log-to-console-blockml';
import { prepareTest } from '~blockml/functions/prepare-test';
import { BmError } from '~blockml/models/bm-error';

let caller = common.CallerEnum.BuildDashboardTile;
let func = common.FuncEnum.FetchSql;
let testId = 'groups/filter-expressions/s__filter-expressions-yesno';

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
      connections: [connection],
      overrideTimezone: undefined
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
      CURRENT_TIMESTAMP() as d2,
      TRUE as d3
  ),
  view__v1__a AS (
    SELECT
      d1 as dim1,
      CASE WHEN ((d3)) IS TRUE THEN 'Yes' ELSE 'No' END as dim4,
      CASE WHEN ((d2)) IS NOT NULL THEN 'Yes' ELSE 'No' END as time1___yesno_has_value
    FROM derived__v1__a
  ),
  main AS (
    SELECT
      a.dim1 as a_dim1
    FROM view__v1__a as a
    WHERE
      (a.dim4 = 'Yes'
      OR a.dim4 = 'No'
      OR 'any' = 'any')
      AND
      (a.time1___yesno_has_value = 'Yes'
      OR a.time1___yesno_has_value = 'No'
      OR 'any' = 'any')
    GROUP BY 1
  )
SELECT
  a_dim1
FROM main
LIMIT 500`;

  t.is(errors.length, 0);
  t.is(entDashboards.length, 1);
  t.is(entDashboards[0].tiles[0].sql.join('\n'), sql);
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
      connections: [connection],
      overrideTimezone: undefined
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
      CURRENT_TIMESTAMP() as d2,
      TRUE as d3
  ),
  view__v1__a AS (
    SELECT
      d1 as dim1,
      CASE WHEN ((d3)) IS TRUE THEN 'Yes' ELSE 'No' END as dim4,
      CASE WHEN ((d2)) IS NOT NULL THEN 'Yes' ELSE 'No' END as time1___yesno_has_value
    FROM derived__v1__a
  ),
  main AS (
    SELECT
      a.dim1 as a_dim1
    FROM view__v1__a as a
    WHERE
      (a.dim4 = 'Yes'
      OR a.dim4 = 'No'
      OR 'any' = 'any')
      AND
      (a.time1___yesno_has_value = 'Yes'
      OR a.time1___yesno_has_value = 'No'
      OR 'any' = 'any')
    GROUP BY 1
  )
SELECT
  a_dim1
FROM main
LIMIT 500`;

  t.is(errors.length, 0);
  t.is(entDashboards.length, 1);
  t.is(entDashboards[0].tiles[0].sql.join('\n'), sql);
});
