import { api } from '../../../../barrels/api';
import { enums } from '../../../../barrels/enums';
import { interfaces } from '../../../../barrels/interfaces';
import { helper } from '../../../../barrels/helper';
import { prepareTest } from '../../../../functions/prepare-test';
import { BmError } from '../../../../models/bm-error';
import * as fse from 'fs-extra';

let caller = enums.CallerEnum.BuildViewField;
let func = enums.FuncEnum.CheckCycles;
let testId = 'e__cycle-in-references';

test(testId, async () => {
  let errors: BmError[];
  let entViews: interfaces.View[];

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

    entViews = await helper.readLog(fromDir, enums.LogTypeEnum.Entities);
    errors = await helper.readLog(fromDir, enums.LogTypeEnum.Errors);
    fse.copySync(fromDir, toDir);
  } catch (e) {
    api.logToConsole(e);
  }

  expect(errors.length).toBe(1);
  expect(entViews.length).toBe(0);

  expect(errors[0].title).toBe(enums.ErTitleEnum.CYCLE_IN_REFERENCES);
  expect(errors[0].lines.length).toBe(3);
  expect(errors[0].lines[0].line).toBe(5);
  expect(errors[0].lines[1].line).toBe(8);
  expect(errors[0].lines[2].line).toBe(11);
});
