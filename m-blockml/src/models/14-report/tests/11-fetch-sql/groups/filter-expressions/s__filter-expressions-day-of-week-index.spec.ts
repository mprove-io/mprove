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
let testId =
  'groups/filter-expressions/s__filter-expressions-day-of-week-index';

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
      d1 as dim1,
      CASE
      WHEN EXTRACT(DAYOFWEEK FROM (d2)) = 1 THEN 7
      ELSE EXTRACT(DAYOFWEEK FROM (d2)) - 1
      END as time1___day_of_week_index
    FROM derived__v1__a
  ),
  main AS (
    SELECT
      a.dim1 as a_dim1
    FROM view__v1__a as a
    WHERE
      (('any' = 'any'
      OR a.time1___day_of_week_index IN (1,2,3))
      AND NOT (a.time1___day_of_week_index IN (4,5,6,7)))
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
      d1 as dim1,
      CASE
      WHEN EXTRACT(DOW FROM (d2)) + 1 = 1 THEN 7
      ELSE EXTRACT(DOW FROM (d2)) + 1 - 1
      END as time1___day_of_week_index
    FROM derived__v1__a
  ),
  main AS (
    SELECT
      a.dim1 as a_dim1
    FROM view__v1__a as a
    WHERE
      (('any' = 'any'
      OR a.time1___day_of_week_index IN (1,2,3))
      AND NOT (a.time1___day_of_week_index IN (4,5,6,7)))
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
