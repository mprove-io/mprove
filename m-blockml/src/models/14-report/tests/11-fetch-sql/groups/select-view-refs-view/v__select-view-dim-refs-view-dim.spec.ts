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
let testId = 'groups/select-view-refs-view/v__select-view-dim-refs-view-dim';

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
    SELECT d1
    FROM tab1
  ),
  view__v1__a AS (
    SELECT
      (FORMAT_TIMESTAMP('%F %H', (d1) + 1)) + 2 as dim2
    FROM derived__v1__a
  ),
  main AS (
    SELECT
      a.dim2 as a_dim2
    FROM view__v1__a as a
    GROUP BY 1
  )
SELECT
  a_dim2
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
    SELECT d1
    FROM tab1
  ),
  view__v1__a AS (
    SELECT
      (TO_CHAR(DATE_TRUNC('hour', (d1) + 1), 'YYYY-MM-DD HH24')) + 2 as dim2
    FROM derived__v1__a
  ),
  main AS (
    SELECT
      a.dim2 as a_dim2
    FROM view__v1__a as a
    GROUP BY 1
  )
SELECT
  a_dim2
FROM main
LIMIT 500`;

  t.is(errors.length, 0);
  t.is(entDashboards.length, 1);
  t.is(entDashboards[0].reports[0].sql.join('\n'), sql);
});
