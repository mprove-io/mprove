import { api } from '../../../../../../barrels/api';
import { enums } from '../../../../../../barrels/enums';
import { interfaces } from '../../../../../../barrels/interfaces';
import { helper } from '../../../../../../barrels/helper';
import { prepareTest } from '../../../../../../functions/prepare-test';
import { BmError } from '../../../../../../models/bm-error';
import * as fse from 'fs-extra';

let caller = enums.CallerEnum.BuildDashboardReport;
let func = enums.FuncEnum.FetchSql;
let testId = 'groups/sql-always-where/v__sql-always-where-refs-view-dim';

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
    '    SELECT d1, d3, d5',
    '    FROM tab1',
    '  ),',
    '  view__v1__a AS (',
    '    SELECT',
    '      d5 as dim5,',
    "      (FORMAT_TIMESTAMP('%F %H', (d1) + 1)) + 2 as dim2,",
    '      (d3) + 4 as dim4',
    '    FROM derived__v1__a',
    '  ),',
    '  main AS (',
    '    SELECT',
    '      a.dim5 as a_dim5',
    '    FROM view__v1__a as a',
    '    WHERE',
    '      (a.dim2 + a.dim4 > 100)',
    '    GROUP BY 1',
    '  )',
    'SELECT',
    '  a_dim5',
    'FROM main',
    'LIMIT 500'
  ]);
});
