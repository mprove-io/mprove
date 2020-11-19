import { api } from '../../../../barrels/api';
import { enums } from '../../../../barrels/enums';
import { interfaces } from '../../../../barrels/interfaces';
import { helper } from '../../../../barrels/helper';
import { prepareTest } from '../../../../functions/prepare-test';
import * as fse from 'fs-extra';

let caller = enums.CallerEnum.FieldBuildModels;
let func = enums.FuncEnum.MakeFieldsDeps;
let testId = 'e__wrong-chars-in-model-fields-refs';

test(testId, async () => {
  let entitiesModels: interfaces.Model[];
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
      type: api.ConnectionTypeEnum.PostgreSQL
    };

    await structService.rebuildStruct({
      dir: dataDir,
      structId: structId,
      projectId: 'p1',
      connections: [connection],
      weekStart: api.ProjectWeekStartEnum.Monday
    });

    entitiesModels = await helper.readLog(fromDir, enums.LogTypeEnum.Entities);
    errors = await helper.readLog(fromDir, enums.LogTypeEnum.Errors);
    fse.copySync(fromDir, toDir);
  } catch (e) {
    api.logToConsole(e);
  }

  expect(entitiesModels.length).toBe(0);
  expect(errors.length).toBe(1);
  expect(errors[0].title).toBe(
    enums.ErTitleEnum.WRONG_CHARS_IN_MODEL_FIELDS_REFS
  );
  expect(errors[0].lines[0].line).toBe(5);
});
