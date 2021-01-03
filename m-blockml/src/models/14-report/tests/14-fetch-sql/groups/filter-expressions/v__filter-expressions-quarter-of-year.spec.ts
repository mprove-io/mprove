import { api } from '../../../../../../barrels/api';
import { enums } from '../../../../../../barrels/enums';
import { interfaces } from '../../../../../../barrels/interfaces';
import { helper } from '../../../../../../barrels/helper';
import { prepareTest } from '../../../../../../functions/prepare-test';
import { BmError } from '../../../../../../models/bm-error';
import * as fse from 'fs-extra';

let caller = enums.CallerEnum.BuildDashboardReport;
let func = enums.FuncEnum.FetchSql;
let testId = 'groups/filter-expressions/v__filter-expressions-quarter-of-year';

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
    "      CONCAT(CAST('Q' AS STRING), CAST(EXTRACT(QUARTER FROM (d2) + 1) AS STRING)) as time1___quarter_of_year",
    '    FROM derived__v1__a',
    '  ),',
    '  main AS (',
    '    SELECT',
    '      a.dim1 as a_dim1',
    '    FROM view__v1__a as a',
    '    WHERE',
    "      ((UPPER(a.time1___quarter_of_year) = UPPER('q1')",
    "      OR UPPER(a.time1___quarter_of_year) = UPPER('q2')",
    "      OR UPPER(a.time1___quarter_of_year) = UPPER('q3')",
    "      OR UPPER(a.time1___quarter_of_year) = UPPER('q4')",
    "      OR 'any' = 'any')",
    "      AND NOT UPPER(a.time1___quarter_of_year) = UPPER('q1')",
    "      AND NOT UPPER(a.time1___quarter_of_year) = UPPER('q2')",
    "      AND NOT UPPER(a.time1___quarter_of_year) = UPPER('q3')",
    "      AND NOT UPPER(a.time1___quarter_of_year) = UPPER('q4'))",
    '    GROUP BY 1',
    '  )',
    'SELECT',
    '  a_dim1',
    'FROM main',
    'LIMIT 500'
  ]);
});
