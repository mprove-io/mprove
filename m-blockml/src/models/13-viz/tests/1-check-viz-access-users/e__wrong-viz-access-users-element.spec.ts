import { api } from '../../../../barrels/api';
import { enums } from '../../../../barrels/enums';
import { interfaces } from '../../../../barrels/interfaces';
import { helper } from '../../../../barrels/helper';
import { prepareTest } from '../../../../functions/prepare-test';
import { BmError } from '../../../../models/bm-error';
import * as fse from 'fs-extra';

let caller = enums.CallerEnum.BuildViz;
let func = enums.FuncEnum.CheckVizAccessUsers;
let testId = 'e__wrong-viz-access-users-element';

test(testId, async () => {
  let errors: BmError[];
  let vizs: interfaces.Viz[];

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
      connections: [connection],
      weekStart: api.ProjectWeekStartEnum.Monday
    });

    errors = await helper.readLog(fromDir, enums.LogTypeEnum.Errors);
    vizs = await helper.readLog(fromDir, enums.LogTypeEnum.Vizs);
    fse.copySync(fromDir, toDir);
  } catch (e) {
    api.logToConsole(e);
  }

  expect(errors.length).toBe(1);
  expect(vizs.length).toBe(0);

  expect(errors[0].title).toBe(
    enums.ErTitleEnum.WRONG_VIZ_ACCESS_USERS_ELEMENT
  );
  expect(errors[0].lines[0].line).toBe(2);
});
