import { api } from '../../../../barrels/api';
import { enums } from '../../../../barrels/enums';
import { interfaces } from '../../../../barrels/interfaces';
import { readLog } from '../../../../helper/_index';
import { prepareTest } from '../../../../functions/prepare-test';

let pack = enums.PackEnum.Field;
let caller = enums.CallerEnum.FieldBuildViews;
let func = enums.FuncEnum.CheckFieldIsObject;
let testId = 'e__field-is-not-a-dictionary';

test(testId, async () => {
  let entities;
  let errors: interfaces.BmErrorC[];

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

    entities = await readLog(logPath, enums.LogTypeEnum.Entities);
    errors = await readLog(logPath, enums.LogTypeEnum.Errors);
  } catch (e) {
    api.logToConsole(e);
  }

  expect(entities.length).toBe(0);
  expect(errors.length).toBe(1);
  expect(errors[0].title).toBe(enums.ErTitleEnum.FIELD_IS_NOT_A_DICTIONARY);
  expect(errors[0].lines[0].line).toBe(3);
});
