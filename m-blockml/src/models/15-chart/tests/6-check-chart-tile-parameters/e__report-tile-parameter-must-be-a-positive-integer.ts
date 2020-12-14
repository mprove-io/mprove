import { api } from '../../../../barrels/api';
import { enums } from '../../../../barrels/enums';
import { interfaces } from '../../../../barrels/interfaces';
import { helper } from '../../../../barrels/helper';
import { prepareTest } from '../../../../functions/prepare-test';
import { BmError } from '../../../../models/bm-error';
import * as fse from 'fs-extra';

let caller = enums.CallerEnum.BuildDashboardChart;
let func = enums.FuncEnum.CheckChartTileParameters;
let testId = 'e__report-tile-parameter-must-be-a-positive-integer';

test(testId, async () => {
  let errors: BmError[];
  let dashboards: interfaces.Dashboard[];

  try {
    let {
      structService,
      structId,
      dataDir,
      fromDir,
      toDir
    } = await prepareTest(caller, func, testId);

    let connection: api.ProjectConnection = {
      name: 'c1',
      type: api.ConnectionTypeEnum.PostgreSQL
    };

    await structService.rebuildStruct({
      dir: dataDir,
      structId: structId,
      projectId: 'p1',
      connections: [connection],
      weekStart: api.ProjectWeekStartEnum.Monday
    });

    errors = await helper.readLog(fromDir, enums.LogTypeEnum.Errors);
    dashboards = await helper.readLog(fromDir, enums.LogTypeEnum.Entities);
    fse.copySync(fromDir, toDir);
  } catch (e) {
    api.logToConsole(e);
  }

  expect(errors.length).toBe(1);
  expect(dashboards.length).toBe(0);

  expect(errors[0].title).toBe(
    enums.ErTitleEnum.REPORT_TILE_PARAMETER_MUST_BE_A_POSITIVE_INTEGER
  );
  expect(errors[0].lines[0].line).toBe(11);
});
