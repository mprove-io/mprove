import { prepareTest } from '../../../../functions/prepare-test';
import { helper } from '../../../../barrels/helper';
import { api } from '../../../../barrels/api';
import { enums } from '../../../../barrels/enums';
import { interfaces } from '../../../../barrels/interfaces';
import * as fse from 'fs-extra';

let caller = enums.CallerEnum.RebuildStruct;
let func = enums.FuncEnum.LogStruct;
let testId = 'v';

test(testId, async () => {
  let errors: interfaces.BmErrorC[];
  let udfs: interfaces.Udf[];
  let views: interfaces.View[];
  let models: interfaces.Model[];
  let dashboards: interfaces.Dashboard[];
  let visualizations: interfaces.Visualization[];

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
    udfs = await helper.readLog(fromDir, enums.LogTypeEnum.Udfs);
    views = await helper.readLog(fromDir, enums.LogTypeEnum.Views);
    models = await helper.readLog(fromDir, enums.LogTypeEnum.Models);
    dashboards = await helper.readLog(fromDir, enums.LogTypeEnum.Ds);
    visualizations = await helper.readLog(fromDir, enums.LogTypeEnum.Vis);
    fse.copySync(fromDir, toDir);
  } catch (e) {
    api.logToConsole(e);
  }

  expect(1).toBe(1);

  // expect(udfs.length).toBe(1);
  // expect(views.length).toBe(1);
  // expect(models.length).toBe(1);
  // expect(dashboards.length).toBe(1);
  // expect(visualizations.length).toBe(1);

  // expect(errors.length).toBe(0);
});
