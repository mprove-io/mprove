import { api } from '../../../../barrels/api';
import { enums } from '../../../../barrels/enums';
import { interfaces } from '../../../../barrels/interfaces';
import { helper } from '../../../../barrels/helper';
import { prepareTest } from '../../../../functions/prepare-test';
import * as fse from 'fs-extra';

let caller = enums.CallerEnum.ViewBuild;
let func = enums.FuncEnum.CheckViewCycles;
let testId = 'e__cycle-in-view-references';

test(testId, async () => {
  let views: interfaces.View[];
  let errors: interfaces.BmErrorC[];

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
      type: api.ConnectionTypeEnum.BigQuery
    };

    await structService.rebuildStruct({
      dir: dataDir,
      structId: structId,
      projectId: 'p1',
      connections: [connection],
      weekStart: api.ProjectWeekStartEnum.Monday
    });

    views = await helper.readLog(fromDir, enums.LogTypeEnum.Views);
    errors = await helper.readLog(fromDir, enums.LogTypeEnum.Errors);
    fse.copySync(fromDir, toDir);
  } catch (e) {
    api.logToConsole(e);
  }

  expect(views.length).toBe(0);
  expect(errors.length).toBe(2);
  expect(errors[0].title).toBe(enums.ErTitleEnum.CYCLE_IN_VIEW_REFERENCES);
  expect(errors[0].lines.length).toBe(3);
  expect(errors[0].lines[0].line).toBe(3);
});
