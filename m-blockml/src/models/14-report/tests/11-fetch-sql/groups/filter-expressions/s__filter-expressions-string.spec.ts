import { api } from '../../../../../../barrels/api';
import { enums } from '../../../../../../barrels/enums';
import { interfaces } from '../../../../../../barrels/interfaces';
import { helper } from '../../../../../../barrels/helper';
import { prepareTest } from '../../../../../../functions/prepare-test';
import { BmError } from '../../../../../../models/bm-error';
import * as fse from 'fs-extra';

let caller = enums.CallerEnum.BuildDashboardReport;
let func = enums.FuncEnum.FetchSql;
let testId = 'groups/filter-expressions/s__filter-expressions-string';

test('1', async () => {
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
    fse.copySync(fromDir, toDir);
  } catch (e) {
    api.logToConsole(e);
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

  expect(errors.length).toBe(0);
  expect(entDashboards.length).toBe(1);
  expect(entDashboards[0].reports[0].sql.join('\n')).toEqual(sql);
});

test('2', async () => {
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
    fse.copySync(fromDir, toDir);
  } catch (e) {
    api.logToConsole(e);
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

  expect(errors.length).toBe(0);
  expect(entDashboards.length).toBe(1);
  expect(entDashboards[0].reports[0].sql.join('\n')).toEqual(sql);
});
