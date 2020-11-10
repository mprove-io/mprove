import { api } from '../../../../barrels/api';
import { enums } from '../../../../barrels/enums';
import { helper } from '../../../../barrels/helper';
import { interfaces } from '../../../../barrels/interfaces';

let pack = '1-yaml';
let func = '10-split-files';
let testId = 'e__wrong-dashboard-name';

test(testId, async () => {
  let errors: interfaces.BmErrorC[];

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
  } catch (e) {
    api.logToConsole(e);
  }

  expect(errors.length).toBe(1);
  expect(errors[0].title).toBe(enums.ErTitleEnum.WRONG_DASHBOARD_NAME);
});
