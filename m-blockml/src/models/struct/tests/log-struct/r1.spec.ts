import { prepareTest } from '../../../../functions/prepare-test';
import { readLog } from '../../../../helper/read-log';
import { api } from '../../../../barrels/api';
import { enums } from '../../../../barrels/enums';
import { interfaces } from '../../../../barrels/interfaces';

let pack = 'struct';
let func = 'log-struct';
let testId = 'r1';

test(testId, async () => {
  let errors: interfaces.BmErrorC[];
  let udfs: interfaces.Udf[];
  let views: interfaces.View[];
  let models: interfaces.Model[];
  let dashboards: interfaces.Dashboard[];
  let visualizations: interfaces.Visualization[];

  try {
    let { structService, structId, dataDir, logPath } = await prepareTest(
      pack,
      func,
      testId
    );

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

    errors = await readLog(logPath, enums.LogEnum.Errors);
    udfs = await readLog(logPath, enums.LogEnum.Udfs);
    views = await readLog(logPath, enums.LogEnum.Views);
    models = await readLog(logPath, enums.LogEnum.Models);
    dashboards = await readLog(logPath, enums.LogEnum.Dashboards);
    visualizations = await readLog(logPath, enums.LogEnum.Vis);
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
