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
  'groups/filter-expressions/v__filter-expressions-day-of-week-index';

test(testId, async () => {
  let errors: BmError[];
  let entDashboards: interfaces.Dashboard[];

  try {
    let {
      structService,
      traceId,
      structId,
      dataDir,
      fromDir,
      toDir
    } = await prepareTest(caller, func, testId);

    let connection: api.ProjectConnection = {
      name: 'c1',
      type: api.ConnectionTypeEnum.BigQuery
    };

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

  expect(errors.length).toBe(0);
  expect(entDashboards.length).toBe(1);

  expect(entDashboards[0].reports[0].sql).toEqual([
    '#standardSQL',
    'WITH',
    '  derived__v1__a AS (',
    '    SELECT d1, d2',
    '    FROM tab1',
    '  ),',
    '  view__v1__a AS (',
    '    SELECT',
    '      d1 as dim1,',
    `      CASE
      WHEN EXTRACT(DAYOFWEEK FROM (d2) + 1) = 1 THEN 7
      ELSE EXTRACT(DAYOFWEEK FROM (d2) + 1) - 1
    END as time1___day_of_week_index`,
    '    FROM derived__v1__a',
    '  ),',
    '  main AS (',
    '    SELECT',
    '      a.dim1 as a_dim1',
    '    FROM view__v1__a as a',
    '    WHERE',
    "      (('any' = 'any'",
    '      OR a.time1___day_of_week_index IN (1,2,3))',
    '      AND NOT (a.time1___day_of_week_index IN (4,5,6,7)))',
    '    GROUP BY 1',
    '  )',
    'SELECT',
    '  a_dim1',
    'FROM main',
    'LIMIT 500'
  ]);
});
