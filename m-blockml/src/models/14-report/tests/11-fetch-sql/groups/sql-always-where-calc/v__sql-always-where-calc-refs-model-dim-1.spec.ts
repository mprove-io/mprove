import { api } from '../../../../../../barrels/api';
import { enums } from '../../../../../../barrels/enums';
import { interfaces } from '../../../../../../barrels/interfaces';
import { helper } from '../../../../../../barrels/helper';
import { prepareTest } from '../../../../../../functions/prepare-test';
import { BmError } from '../../../../../../models/bm-error';
import * as fse from 'fs-extra';

let caller = enums.CallerEnum.BuildDashboardReport;
let func = enums.FuncEnum.FetchSql;
let testId =
  'groups/sql-always-where-calc/v__sql-always-where-calc-refs-model-dim-1';

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
  view__v1__a AS (
    SELECT
      1 as no_fields_selected
    FROM derived__v1__a
  ),
  main AS (
    SELECT
      d5 as mf_dim5,
      (FORMAT_TIMESTAMP('%F %H', (d1) + 1)) + 2 as mf_dim2,
      (d3) + 4 as mf_dim4
    FROM view__v1__a as a
    GROUP BY 1, 2, 3
  )
SELECT
  mf_dim5
FROM main
WHERE
  (mf_dim2 + mf_dim4 > 100)
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
  view__v1__a AS (
    SELECT
      1 as no_fields_selected
    FROM derived__v1__a
  ),
  main AS (
    SELECT
      d5 as mf_dim5,
      (TO_CHAR(DATE_TRUNC('hour', (d1) + 1), 'YYYY-MM-DD HH24')) + 2 as mf_dim2,
      (d3) + 4 as mf_dim4
    FROM view__v1__a as a
    GROUP BY 1, 2, 3
  )
SELECT
  mf_dim5
FROM main
WHERE
  (mf_dim2 + mf_dim4 > 100)
LIMIT 500`;

  expect(errors.length).toBe(0);
  expect(entDashboards.length).toBe(1);
  expect(entDashboards[0].reports[0].sql.join('\n')).toEqual(sql);
});