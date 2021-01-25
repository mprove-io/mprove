import { api } from '~/barrels/api';
import { enums } from '~/barrels/enums';
import { interfaces } from '~/barrels/interfaces';
import { helper } from '~/barrels/helper';
import { prepareTest } from '~/functions/prepare-test';
import test from 'ava';
import { BmError } from '~/models/bm-error';
import * as fse from 'fs-extra';

let caller = enums.CallerEnum.BuildView;
let func = enums.FuncEnum.ProcessViewRefs;
let testId = 'v__select-mea';

test('1', async t => {
  let errors: BmError[];
  let views: interfaces.View[];

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
    views = await helper.readLog(fromDir, enums.LogTypeEnum.Views);
    if (helper.isDefined(toDir)) {
      fse.copySync(fromDir, toDir);
    }
  } catch (e) {
    api.logToConsole(e);
  }

  let sub = `  v2__v1__a AS (
    WITH
      derived__v1 AS (
        SELECT d1, d3, d5, d7
        FROM tab1
      ),
      view__v1 AS (
        SELECT
          (FORMAT_TIMESTAMP('%F %H', mprovetimestampstart(d1) + 1mprovetimestampend)) + 2 as dim2,
          (d3) + 4 as dim4
        FROM derived__v1
      ),
      main__v1 AS (
        SELECT
          COALESCE(mprove_array_sum(ARRAY_AGG(DISTINCT CONCAT(CONCAT(CAST(dim4 + mk1 AS STRING), '||'), CAST(dim2 + ms1 AS STRING)))), 0) as mea1
        FROM view__v1
      )
    SELECT
      mea1
    FROM main__v1
  ),`;

  t.is(errors.length, 0);
  t.is(views.length, 2);
  t.is(views[1].parts['v2__v1__a'].sub.join('\n'), sub);
});

test('2', async t => {
  let errors: BmError[];
  let views: interfaces.View[];

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
    views = await helper.readLog(fromDir, enums.LogTypeEnum.Views);
    if (helper.isDefined(toDir)) {
      fse.copySync(fromDir, toDir);
    }
  } catch (e) {
    api.logToConsole(e);
  }

  let sub = `  v2__v1__a AS (
    WITH
      derived__v1 AS (
        SELECT d1, d3, d5, d7
        FROM tab1
      ),
      view__v1 AS (
        SELECT
          (TO_CHAR(DATE_TRUNC('hour', mprovetimestampstart(d1) + 1mprovetimestampend), 'YYYY-MM-DD HH24')) + 2 as dim2,
          (d3) + 4 as dim4
        FROM derived__v1
      ),
      main__v1 AS (
        SELECT
          COALESCE(COALESCE(CAST((SUM(DISTINCT CAST(FLOOR(COALESCE(dim2 + ms1, 0)*(1000000*1.0)) AS DECIMAL(38,0)) + CAST(('x' || lpad(LEFT(MD5(CAST(dim4 + mk1 AS VARCHAR)),15), 16, '0'))::bit(64)::bigint AS DECIMAL(38,0))* 1.0e8 + CAST(('x' || lpad(RIGHT(MD5(CAST(dim4 + mk1 AS VARCHAR)),15), 16, '0'))::bit(64)::bigint AS DECIMAL(38,0))) - SUM(DISTINCT CAST(('x' || lpad(LEFT(MD5(CAST(dim4 + mk1 AS VARCHAR)),15), 16, '0'))::bit(64)::bigint AS DECIMAL(38,0))* 1.0e8 + CAST(('x' || lpad(RIGHT(MD5(CAST(dim4 + mk1 AS VARCHAR)),15), 16, '0'))::bit(64)::bigint AS DECIMAL(38,0)))) AS DOUBLE PRECISION) / CAST((1000000*1.0) AS DOUBLE PRECISION), 0), 0) as mea1
        FROM view__v1
      )
    SELECT
      mea1
    FROM main__v1
  ),`;

  t.is(errors.length, 0);
  t.is(views.length, 2);
  t.is(views[1].parts['v2__v1__a'].sub.join('\n'), sub);
});
