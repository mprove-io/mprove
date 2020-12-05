import { api } from '../../../../barrels/api';
import { enums } from '../../../../barrels/enums';
import { interfaces } from '../../../../barrels/interfaces';
import { helper } from '../../../../barrels/helper';
import { prepareTest } from '../../../../functions/prepare-test';
import * as fse from 'fs-extra';

let caller = enums.CallerEnum.BuildChart;
let func = enums.FuncEnum.CheckChartData;
let testId = 'e__report-data-unexpected-list';

test(testId, async () => {
  let errors: interfaces.BmErrorC[];
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
    dashboards = await helper.readLog(fromDir, enums.LogTypeEnum.Ds);
    fse.copySync(fromDir, toDir);
  } catch (e) {
    api.logToConsole(e);
  }

  expect(errors.length).toBe(1);
  expect(dashboards.length).toBe(0);

  expect(errors[0].title).toBe(enums.ErTitleEnum.REPORT_DATA_UNEXPECTED_LIST);
  expect(errors[0].lines[0].line).toBe(9);
});
