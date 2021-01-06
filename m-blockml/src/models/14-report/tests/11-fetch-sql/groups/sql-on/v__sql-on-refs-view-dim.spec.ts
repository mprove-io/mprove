import { api } from '../../../../../../barrels/api';
import { enums } from '../../../../../../barrels/enums';
import { interfaces } from '../../../../../../barrels/interfaces';
import { helper } from '../../../../../../barrels/helper';
import { prepareTest } from '../../../../../../functions/prepare-test';
import { BmError } from '../../../../../../models/bm-error';
import * as fse from 'fs-extra';

let caller = enums.CallerEnum.BuildDashboardReport;
let func = enums.FuncEnum.FetchSql;
let testId = 'groups/sql-on/v__sql-on-refs-view-dim';

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
    SELECT d1, d3, d5
    FROM tab1
  ),
  derived__v1__b AS (
    SELECT d1, d3, d5
    FROM tab1
  ),
  view__v1__a AS (
    SELECT
      (FORMAT_TIMESTAMP('%F %H', (d1) + 1)) + 2 as dim2
    FROM derived__v1__a
  ),
  view__v1__b AS (
    SELECT
      d5 as dim5,
      (d3) + 4 as dim4
    FROM derived__v1__b
  ),
  main AS (
    SELECT
      b.dim5 as b_dim5
    FROM view__v1__a as a
    LEFT OUTER JOIN view__v1__b as b ON a.dim2 = b.dim4
    GROUP BY 1
  )
SELECT
  b_dim5
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
    SELECT d1, d3, d5
    FROM tab1
  ),
  derived__v1__b AS (
    SELECT d1, d3, d5
    FROM tab1
  ),
  view__v1__a AS (
    SELECT
      (TO_CHAR(DATE_TRUNC('hour', (d1) + 1), 'YYYY-MM-DD HH24')) + 2 as dim2
    FROM derived__v1__a
  ),
  view__v1__b AS (
    SELECT
      d5 as dim5,
      (d3) + 4 as dim4
    FROM derived__v1__b
  ),
  main AS (
    SELECT
      b.dim5 as b_dim5
    FROM view__v1__a as a
    LEFT OUTER JOIN view__v1__b as b ON a.dim2 = b.dim4
    GROUP BY 1
  )
SELECT
  b_dim5
FROM main
LIMIT 500`;

  expect(errors.length).toBe(0);
  expect(entDashboards.length).toBe(1);
  expect(entDashboards[0].reports[0].sql.join('\n')).toEqual(sql);
});
