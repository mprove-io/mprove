import { api } from '../../../../barrels/api';
import { enums } from '../../../../barrels/enums';
import { interfaces } from '../../../../barrels/interfaces';
import { helper } from '../../../../barrels/helper';
import { prepareTest } from '../../../../functions/prepare-test';
import * as fse from 'fs-extra';

let caller = enums.CallerEnum.ModelBuild;
let func = enums.FuncEnum.MakeJoins;
let testId = 'e__join-calls-missing-view';

test(testId, async () => {
  let models: interfaces.Model[];
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

    models = await helper.readLog(fromDir, enums.LogTypeEnum.Models);
    errors = await helper.readLog(fromDir, enums.LogTypeEnum.Errors);
    fse.copySync(fromDir, toDir);
  } catch (e) {
    api.logToConsole(e);
  }

  expect(models.length).toBe(0);
  expect(errors.length).toBe(2);
  expect(errors[0].title).toBe(enums.ErTitleEnum.JOIN_CALLS_MISSING_VIEW);
  expect(errors[0].lines[0].line).toBe(4);
  expect(errors[1].title).toBe(enums.ErTitleEnum.JOIN_CALLS_MISSING_VIEW);
  expect(errors[1].lines[0].line).toBe(7);
});
