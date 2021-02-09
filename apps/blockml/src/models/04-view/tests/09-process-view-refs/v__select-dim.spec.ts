import test from 'ava';
import * as fse from 'fs-extra';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { prepareTest } from '~blockml/functions/prepare-test';
import { BmError } from '~blockml/models/bm-error';

let caller = enums.CallerEnum.BuildView;
let func = enums.FuncEnum.ProcessViewRefs;
let testId = 'v__select-dim';

test('1', async t => {
  let errors: BmError[];
  let views: interfaces.View[];

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
    views = await helper.readLog(fromDir, enums.LogTypeEnum.Views);
    if (common.isDefined(toDir)) {
      fse.copySync(fromDir, toDir);
    }
  } catch (e) {
    common.logToConsole(e);
  }

  let sub = `  v2__v1__a AS (
    WITH
      derived__v1 AS (
        SELECT d1
        FROM tab1
      ),
      view__v1 AS (
        SELECT
          (FORMAT_TIMESTAMP('%F %H', mprovetimestampstart(d1) + 1mprovetimestampend)) + 2 as dim2
        FROM derived__v1
      ),
      main__v1 AS (
        SELECT
          dim2 as dim2
        FROM view__v1
        GROUP BY 1
      )
    SELECT
      dim2
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
    views = await helper.readLog(fromDir, enums.LogTypeEnum.Views);
    if (common.isDefined(toDir)) {
      fse.copySync(fromDir, toDir);
    }
  } catch (e) {
    common.logToConsole(e);
  }

  let sub = `  v2__v1__a AS (
    WITH
      derived__v1 AS (
        SELECT d1
        FROM tab1
      ),
      view__v1 AS (
        SELECT
          (TO_CHAR(DATE_TRUNC('hour', mprovetimestampstart(d1) + 1mprovetimestampend), 'YYYY-MM-DD HH24')) + 2 as dim2
        FROM derived__v1
      ),
      main__v1 AS (
        SELECT
          dim2 as dim2
        FROM view__v1
        GROUP BY 1
      )
    SELECT
      dim2
    FROM main__v1
  ),`;

  t.is(errors.length, 0);
  t.is(views.length, 2);
  t.is(views[1].parts['v2__v1__a'].sub.join('\n'), sub);
});
