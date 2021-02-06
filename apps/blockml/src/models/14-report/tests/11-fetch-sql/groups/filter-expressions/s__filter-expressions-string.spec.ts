import test from 'ava';
import * as fse from 'fs-extra';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { prepareTest } from '~blockml/functions/prepare-test';
import { BmError } from '~blockml/models/bm-error';

let caller = enums.CallerEnum.BuildDashboardReport;
let func = enums.FuncEnum.FetchSql;
let testId = 'groups/filter-expressions/s__filter-expressions-string';

test('1', async t => {
  let errors: BmError[];
  let entDashboards: interfaces.Dashboard[];

  try {
    let connection: common.ProjectConnection = {
      name: 'c1',
      type: common.ConnectionTypeEnum.BigQuery
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
      weekStart: common.ProjectWeekStartEnum.Monday
    });

    errors = await helper.readLog(fromDir, enums.LogTypeEnum.Errors);
    entDashboards = await helper.readLog(fromDir, enums.LogTypeEnum.Entities);
    if (helper.isDefined(toDir)) {
      fse.copySync(fromDir, toDir);
    }
  } catch (e) {
    common.logToConsole(e);
  }

  let sql = `#standardSQL
WITH
  derived__v1__a AS (
    SELECT 1 as d1,
    'bar' as d2
  ),
  view__v1__a AS (
    SELECT
      d1 as dim1,
      d2 as dim2
    FROM derived__v1__a
  ),
  main AS (
    SELECT
      a.dim1 as a_dim1
    FROM view__v1__a as a
    WHERE
      ((a.dim2 = 'foo'
      OR a.dim2 LIKE '%foo%'
      OR a.dim2 LIKE 'foo%'
      OR a.dim2 LIKE '%foo'
      OR (a.dim2 IS NULL)
      OR (a.dim2 IS NULL OR LENGTH(CAST(a.dim2 AS STRING)) = 0)
      OR 'any' = 'any')
      AND NOT a.dim2 = 'foo'
      AND NOT a.dim2 LIKE '%foo%'
      AND NOT a.dim2 LIKE 'foo%'
      AND NOT a.dim2 LIKE '%foo'
      AND NOT (a.dim2 IS NULL OR LENGTH(CAST(a.dim2 AS STRING)) = 0)
      AND NOT (a.dim2 IS NULL))
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
    let connection: common.ProjectConnection = {
      name: 'c1',
      type: common.ConnectionTypeEnum.PostgreSQL
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
      weekStart: common.ProjectWeekStartEnum.Monday
    });

    errors = await helper.readLog(fromDir, enums.LogTypeEnum.Errors);
    entDashboards = await helper.readLog(fromDir, enums.LogTypeEnum.Entities);
    if (helper.isDefined(toDir)) {
      fse.copySync(fromDir, toDir);
    }
  } catch (e) {
    common.logToConsole(e);
  }

  let sql = `WITH
  derived__v1__a AS (
    SELECT 1 as d1,
    'bar' as d2
  ),
  view__v1__a AS (
    SELECT
      d1 as dim1,
      d2 as dim2
    FROM derived__v1__a
  ),
  main AS (
    SELECT
      a.dim1 as a_dim1
    FROM view__v1__a as a
    WHERE
      ((a.dim2 = 'foo'
      OR a.dim2 LIKE '%foo%'
      OR a.dim2 LIKE 'foo%'
      OR a.dim2 LIKE '%foo'
      OR (a.dim2 IS NULL)
      OR (a.dim2 IS NULL OR LENGTH(CAST(a.dim2 AS TEXT)) = 0)
      OR 'any' = 'any')
      AND NOT a.dim2 = 'foo'
      AND NOT a.dim2 LIKE '%foo%'
      AND NOT a.dim2 LIKE 'foo%'
      AND NOT a.dim2 LIKE '%foo'
      AND NOT (a.dim2 IS NULL OR LENGTH(CAST(a.dim2 AS TEXT)) = 0)
      AND NOT (a.dim2 IS NULL))
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
