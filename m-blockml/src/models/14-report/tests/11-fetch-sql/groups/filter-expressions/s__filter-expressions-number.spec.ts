import { api } from '~/barrels/api';
import { enums } from '~/barrels/enums';
import { interfaces } from '~/barrels/interfaces';
import { helper } from '~/barrels/helper';
import { prepareTest } from '~/functions/prepare-test';
import test from 'ava';
import { BmError } from '~/models/bm-error';
import * as fse from 'fs-extra';

let caller = enums.CallerEnum.BuildDashboardReport;
let func = enums.FuncEnum.FetchSql;
let testId = 'groups/filter-expressions/s__filter-expressions-number';

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
      2 as d2
  ),
  view__v1__a AS (
    SELECT
      d1 as dim1,
      (d2) + 3 as dim3
    FROM derived__v1__a
  ),
  main AS (
    SELECT
      a.dim1 as a_dim1
    FROM view__v1__a as a
    WHERE
      ((a.dim3 > 100
      OR a.dim3 >= 100
      OR a.dim3 < 100
      OR a.dim3 <= 100
      OR ((a.dim3 >= 100) AND (a.dim3 <= 200))
      OR ((a.dim3 >= 100) AND (a.dim3 < 200))
      OR ((a.dim3 > 100) AND (a.dim3 <= 200))
      OR ((a.dim3 > 100) AND (a.dim3 < 200))
      OR (a.dim3 IS NULL)
      OR 'any' = 'any'
      OR a.dim3 IN (105,110,115,120))
      AND NOT ((a.dim3 >= 100) AND (a.dim3 <= 200))
      AND NOT ((a.dim3 >= 100) AND (a.dim3 < 200))
      AND NOT ((a.dim3 > 100) AND (a.dim3 <= 200))
      AND NOT ((a.dim3 > 100) AND (a.dim3 < 200))
      AND NOT (a.dim3 IS NULL)
      AND NOT (a.dim3 IN (105,110,115,120)))
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
      2 as d2
  ),
  view__v1__a AS (
    SELECT
      d1 as dim1,
      (d2) + 3 as dim3
    FROM derived__v1__a
  ),
  main AS (
    SELECT
      a.dim1 as a_dim1
    FROM view__v1__a as a
    WHERE
      ((a.dim3 > 100
      OR a.dim3 >= 100
      OR a.dim3 < 100
      OR a.dim3 <= 100
      OR ((a.dim3 >= 100) AND (a.dim3 <= 200))
      OR ((a.dim3 >= 100) AND (a.dim3 < 200))
      OR ((a.dim3 > 100) AND (a.dim3 <= 200))
      OR ((a.dim3 > 100) AND (a.dim3 < 200))
      OR (a.dim3 IS NULL)
      OR 'any' = 'any'
      OR a.dim3 IN (105,110,115,120))
      AND NOT ((a.dim3 >= 100) AND (a.dim3 <= 200))
      AND NOT ((a.dim3 >= 100) AND (a.dim3 < 200))
      AND NOT ((a.dim3 > 100) AND (a.dim3 <= 200))
      AND NOT ((a.dim3 > 100) AND (a.dim3 < 200))
      AND NOT (a.dim3 IS NULL)
      AND NOT (a.dim3 IN (105,110,115,120)))
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
