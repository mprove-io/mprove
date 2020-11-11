import { api } from '../../../../barrels/api';
import { enums } from '../../../../barrels/enums';
import { helper } from '../../../../barrels/helper';
import { interfaces } from '../../../../barrels/interfaces';

let pack = '1-yaml';
let func = '10-split-files';
let testId = 'e__wrong-visualization-name';

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
      logPath
    } = await helper.prepareTest(pack, func, testId);

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

    errors = await helper.readLog(logPath, enums.LogEnum.Errors);
    udfs = await helper.readLog(logPath, enums.LogEnum.Udfs);
    views = await helper.readLog(logPath, enums.LogEnum.Views);
    models = await helper.readLog(logPath, enums.LogEnum.Models);
    dashboards = await helper.readLog(logPath, enums.LogEnum.Dashboards);
    visualizations = await helper.readLog(logPath, enums.LogEnum.Vis);
  } catch (e) {
    api.logToConsole(e);
  }

  expect(udfs.length).toBe(0);
  expect(views.length).toBe(0);
  expect(models.length).toBe(0);
  expect(dashboards.length).toBe(0);
  expect(visualizations.length).toBe(0);

  expect(errors.length).toBe(1);
  expect(errors[0].title).toBe(enums.ErTitleEnum.WRONG_VISUALIZATION_NAME);
  expect(errors[0].lines[0].line).toBe(1);
});
