import { api } from '../../../../barrels/api';
import { enums } from '../../../../barrels/enums';
import { interfaces } from '../../../../barrels/interfaces';
import { helper } from '../../../../barrels/helper';
import { prepareTest } from '../../../../functions/prepare-test';
import { BmError } from '../../../../models/bm-error';
import * as fse from 'fs-extra';

let caller = enums.CallerEnum.BuildView;
let func = enums.FuncEnum.ProcessViewRefs;
let testId = 'v__select-dim';

test('1', async () => {
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
    fse.copySync(fromDir, toDir);
  } catch (e) {
    api.logToConsole(e);
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

  expect(errors.length).toBe(0);
  expect(views.length).toBe(2);
  expect(views[1].parts['v2__v1__a'].sub.join('\n')).toEqual(sub);
});

test('2', async () => {
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
    fse.copySync(fromDir, toDir);
  } catch (e) {
    api.logToConsole(e);
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

  expect(errors.length).toBe(0);
  expect(views.length).toBe(2);
  expect(views[1].parts['v2__v1__a'].sub.join('\n')).toEqual(sub);
});
