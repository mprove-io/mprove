import { api } from '../../../../barrels/api';
import { enums } from '../../../../barrels/enums';
import { interfaces } from '../../../../barrels/interfaces';
import { helper } from '../../../../barrels/helper';
import { prepareTest } from '../../../../functions/prepare-test';
import { BmError } from '../../../../models/bm-error';
import * as fse from 'fs-extra';

let caller = enums.CallerEnum.BuildDashboard;
let func = enums.FuncEnum.CheckVMDFilterDefaults;
let testId = 'e__wrong-filter-expression-3';

test(testId, async () => {
  let errors: BmError[];
  let entitiesDashboards: interfaces.Dashboard[];

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
    entitiesDashboards = await helper.readLog(
      fromDir,
      enums.LogTypeEnum.Entities
    );
    fse.copySync(fromDir, toDir);
  } catch (e) {
    api.logToConsole(e);
  }

  expect(errors.length).toBe(1);
  expect(entitiesDashboards.length).toBe(0);

  expect(errors[0].title).toBe(enums.ErTitleEnum.WRONG_FILTER_EXPRESSION);
  expect(errors[0].lines[0].line).toBe(5);
});
