import test from 'ava';
import * as fse from 'fs-extra';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { logToConsoleBlockml } from '~blockml/functions/log-to-console-blockml';
import { prepareTest } from '~blockml/functions/prepare-test';
import { BmError } from '~blockml/models/bm-error';

let caller = enums.CallerEnum.BuildView;
let func = enums.FuncEnum.ProcessViewRefs;
let testId = 'v__select-calc';

test('1', async t => {
  let errors: BmError[];
  let views: interfaces.View[];

  let pLogger;

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
      pinoLogger
    } = await prepareTest(caller, func, testId, connection);

    pLogger = pinoLogger;

    await structService.rebuildStruct({
      traceId: traceId,
      dir: dataDir,
      structId: structId,
      envId: common.PROJECT_ENV_PROD,
      evs: [],
      connections: [connection]
    });

    errors = await helper.readLog(fromDir, enums.LogTypeEnum.Errors);
    views = await helper.readLog(fromDir, enums.LogTypeEnum.Views);
    if (common.isDefined(toDir)) {
      fse.copySync(fromDir, toDir);
    }
  } catch (e) {
    logToConsoleBlockml({
      log: e,
      logLevel: common.LogLevelEnum.Error,
      pinoLogger: pLogger
    });
  }

  let sub = `  v2__v1__a AS (
    WITH
      derived__v1 AS (
        SELECT d1, d3, d5, d7
        FROM tab1
      ),
      view__v1 AS (
        SELECT
          (d5) + 6 as dim6,
          (d7) + 8 as dim8,
          (FORMAT_TIMESTAMP('%F %H', mprovetimestampstart(d1) + 1mprovetimestampend)) + 2 as dim2,
          (d3) + 4 as dim4
        FROM derived__v1
      ),
      main__v1 AS (
        SELECT
          COALESCE(mprove_array_sum(ARRAY_AGG(DISTINCT CONCAT(CONCAT(CAST(dim4 + mk1 AS STRING), '||'), CAST(dim2 + ms1 AS STRING)))), 0) as mea1,
          dim6 as dim6,
          dim8 as dim8
        FROM view__v1
        GROUP BY 2, 3
      )
    SELECT
      (mea1 + dim6 + 1) + dim8 + 2 as calc2
    FROM main__v1
  ),`;

  t.is(errors.length, 0);
  t.is(views.length, 2);
  t.is(views[1].parts['v2__v1__a'].sub.join('\n'), sub);
});

test('2', async t => {
  let errors: BmError[];
  let views: interfaces.View[];

  let pLogger;

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
      pinoLogger
    } = await prepareTest(caller, func, testId, connection);

    pLogger = pinoLogger;

    await structService.rebuildStruct({
      traceId: traceId,
      dir: dataDir,
      structId: structId,
      envId: common.PROJECT_ENV_PROD,
      evs: [],
      connections: [connection]
    });

    errors = await helper.readLog(fromDir, enums.LogTypeEnum.Errors);
    views = await helper.readLog(fromDir, enums.LogTypeEnum.Views);
    if (common.isDefined(toDir)) {
      fse.copySync(fromDir, toDir);
    }
  } catch (e) {
    logToConsoleBlockml({
      log: e,
      logLevel: common.LogLevelEnum.Error,
      pinoLogger: pLogger
    });
  }

  let sub = `  v2__v1__a AS (
    WITH
      derived__v1 AS (
        SELECT d1, d3, d5, d7
        FROM tab1
      ),
      view__v1 AS (
        SELECT
          (d5) + 6 as dim6,
          (d7) + 8 as dim8,
          (TO_CHAR(DATE_TRUNC('hour', mprovetimestampstart(d1) + 1mprovetimestampend), 'YYYY-MM-DD HH24')) + 2 as dim2,
          (d3) + 4 as dim4
        FROM derived__v1
      ),
      main__v1 AS (
        SELECT
          COALESCE(COALESCE(CAST((SUM(DISTINCT CAST(FLOOR(COALESCE(dim2 + ms1, 0)*(1000000*1.0)) AS DECIMAL(38,0)) + CAST(('x' || lpad(LEFT(MD5(CAST(dim4 + mk1 AS VARCHAR)),15), 16, '0'))::bit(64)::bigint AS DECIMAL(38,0))* 1.0e8 + CAST(('x' || lpad(RIGHT(MD5(CAST(dim4 + mk1 AS VARCHAR)),15), 16, '0'))::bit(64)::bigint AS DECIMAL(38,0))) - SUM(DISTINCT CAST(('x' || lpad(LEFT(MD5(CAST(dim4 + mk1 AS VARCHAR)),15), 16, '0'))::bit(64)::bigint AS DECIMAL(38,0))* 1.0e8 + CAST(('x' || lpad(RIGHT(MD5(CAST(dim4 + mk1 AS VARCHAR)),15), 16, '0'))::bit(64)::bigint AS DECIMAL(38,0)))) AS DOUBLE PRECISION) / CAST((1000000*1.0) AS DOUBLE PRECISION), 0), 0) as mea1,
          dim6 as dim6,
          dim8 as dim8
        FROM view__v1
        GROUP BY 2, 3
      )
    SELECT
      (mea1 + dim6 + 1) + dim8 + 2 as calc2
    FROM main__v1
  ),`;

  t.is(errors.length, 0);
  t.is(views.length, 2);
  t.is(views[1].parts['v2__v1__a'].sub.join('\n'), sub);
});
