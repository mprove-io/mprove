import { api } from '../../../../barrels/api';
import { enums } from '../../../../barrels/enums';
import { helper } from '../../../../barrels/helper';
import { interfaces } from '../../../../barrels/interfaces';
import { prepareTest } from '../../../../functions/prepare-test';

let pack = enums.PackEnum.Yaml;
let caller = enums.CallerEnum.YamlBuild;
let func = enums.FuncEnum.SplitFiles;
let testId = 'e__wrong-model-name';

test(testId, async () => {
  let errors: interfaces.BmErrorC[];
  let udfs: interfaces.Udf[];
  let views: interfaces.View[];
  let models: interfaces.Model[];
  let dashboards: interfaces.Dashboard[];
  let visualizations: interfaces.Visualization[];

  try {
    let { structService, structId, dataDir, logPath } = await prepareTest({
      pack: pack,
      caller: caller,
      func: func,
      testId: testId
    });

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

    errors = await helper.readLog(logPath, enums.LogTypeEnum.Errors);
    udfs = await helper.readLog(logPath, enums.LogTypeEnum.Udfs);
    views = await helper.readLog(logPath, enums.LogTypeEnum.Views);
    models = await helper.readLog(logPath, enums.LogTypeEnum.Models);
    dashboards = await helper.readLog(logPath, enums.LogTypeEnum.Dashboards);
    visualizations = await helper.readLog(logPath, enums.LogTypeEnum.Vis);
  } catch (e) {
    api.logToConsole(e);
  }

  expect(udfs.length).toBe(0);
  expect(views.length).toBe(0);
  expect(models.length).toBe(0);
  expect(dashboards.length).toBe(0);
  expect(visualizations.length).toBe(0);

  expect(errors.length).toBe(1);
  expect(errors[0].title).toBe(enums.ErTitleEnum.WRONG_MODEL_NAME);
  expect(errors[0].lines[0].line).toBe(1);
});
