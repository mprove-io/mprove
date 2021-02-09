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
let testId = 'groups/filter-expressions/s__filter-expressions-month-name';

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
    if (common.isDefined(toDir)) {
      fse.copySync(fromDir, toDir);
    }
  } catch (e) {
    common.logToConsole(e);
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
      WHEN EXTRACT(MONTH FROM (d2)) = 1 THEN 'January'
      WHEN EXTRACT(MONTH FROM (d2)) = 2 THEN 'February'
      WHEN EXTRACT(MONTH FROM (d2)) = 3 THEN 'March'
      WHEN EXTRACT(MONTH FROM (d2)) = 4 THEN 'April'
      WHEN EXTRACT(MONTH FROM (d2)) = 5 THEN 'May'
      WHEN EXTRACT(MONTH FROM (d2)) = 6 THEN 'June'
      WHEN EXTRACT(MONTH FROM (d2)) = 7 THEN 'July'
      WHEN EXTRACT(MONTH FROM (d2)) = 8 THEN 'August'
      WHEN EXTRACT(MONTH FROM (d2)) = 9 THEN 'September'
      WHEN EXTRACT(MONTH FROM (d2)) = 10 THEN 'October'
      WHEN EXTRACT(MONTH FROM (d2)) = 11 THEN 'November'
      WHEN EXTRACT(MONTH FROM (d2)) = 12 THEN 'December'
      END as time1___month_name
    FROM derived__v1__a
  ),
  main AS (
    SELECT
      a.dim1 as a_dim1
    FROM view__v1__a as a
    WHERE
      ((UPPER(a.time1___month_name) = UPPER('January')
      OR UPPER(a.time1___month_name) = UPPER('February')
      OR UPPER(a.time1___month_name) = UPPER('March')
      OR UPPER(a.time1___month_name) = UPPER('April')
      OR UPPER(a.time1___month_name) = UPPER('May')
      OR UPPER(a.time1___month_name) = UPPER('June')
      OR UPPER(a.time1___month_name) = UPPER('July')
      OR UPPER(a.time1___month_name) = UPPER('August')
      OR UPPER(a.time1___month_name) = UPPER('September')
      OR UPPER(a.time1___month_name) = UPPER('October')
      OR UPPER(a.time1___month_name) = UPPER('November')
      OR UPPER(a.time1___month_name) = UPPER('December')
      OR 'any' = 'any')
      AND NOT UPPER(a.time1___month_name) = UPPER('January')
      AND NOT UPPER(a.time1___month_name) = UPPER('February')
      AND NOT UPPER(a.time1___month_name) = UPPER('March')
      AND NOT UPPER(a.time1___month_name) = UPPER('April')
      AND NOT UPPER(a.time1___month_name) = UPPER('May')
      AND NOT UPPER(a.time1___month_name) = UPPER('June')
      AND NOT UPPER(a.time1___month_name) = UPPER('July')
      AND NOT UPPER(a.time1___month_name) = UPPER('August')
      AND NOT UPPER(a.time1___month_name) = UPPER('September')
      AND NOT UPPER(a.time1___month_name) = UPPER('October')
      AND NOT UPPER(a.time1___month_name) = UPPER('November')
      AND NOT UPPER(a.time1___month_name) = UPPER('December'))
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
    if (common.isDefined(toDir)) {
      fse.copySync(fromDir, toDir);
    }
  } catch (e) {
    common.logToConsole(e);
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
      TO_CHAR((d2), 'FMMonth') as time1___month_name
    FROM derived__v1__a
  ),
  main AS (
    SELECT
      a.dim1 as a_dim1
    FROM view__v1__a as a
    WHERE
      ((UPPER(a.time1___month_name) = UPPER('January')
      OR UPPER(a.time1___month_name) = UPPER('February')
      OR UPPER(a.time1___month_name) = UPPER('March')
      OR UPPER(a.time1___month_name) = UPPER('April')
      OR UPPER(a.time1___month_name) = UPPER('May')
      OR UPPER(a.time1___month_name) = UPPER('June')
      OR UPPER(a.time1___month_name) = UPPER('July')
      OR UPPER(a.time1___month_name) = UPPER('August')
      OR UPPER(a.time1___month_name) = UPPER('September')
      OR UPPER(a.time1___month_name) = UPPER('October')
      OR UPPER(a.time1___month_name) = UPPER('November')
      OR UPPER(a.time1___month_name) = UPPER('December')
      OR 'any' = 'any')
      AND NOT UPPER(a.time1___month_name) = UPPER('January')
      AND NOT UPPER(a.time1___month_name) = UPPER('February')
      AND NOT UPPER(a.time1___month_name) = UPPER('March')
      AND NOT UPPER(a.time1___month_name) = UPPER('April')
      AND NOT UPPER(a.time1___month_name) = UPPER('May')
      AND NOT UPPER(a.time1___month_name) = UPPER('June')
      AND NOT UPPER(a.time1___month_name) = UPPER('July')
      AND NOT UPPER(a.time1___month_name) = UPPER('August')
      AND NOT UPPER(a.time1___month_name) = UPPER('September')
      AND NOT UPPER(a.time1___month_name) = UPPER('October')
      AND NOT UPPER(a.time1___month_name) = UPPER('November')
      AND NOT UPPER(a.time1___month_name) = UPPER('December'))
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
