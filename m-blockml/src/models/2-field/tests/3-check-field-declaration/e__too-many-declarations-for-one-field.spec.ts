import { api } from '../../../../barrels/api';
import { enums } from '../../../../barrels/enums';
import { interfaces } from '../../../../barrels/interfaces';
import { helper } from '../../../../barrels/helper';
import { prepareTest } from '../../../../functions/prepare-test';
import * as fse from 'fs-extra';

let caller = enums.CallerEnum.FieldBuildViews;
let func = enums.FuncEnum.CheckFieldDeclaration;
let testId = 'e__too-many-declarations-for-one-field';

test(testId, async () => {
  let entities;
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

    entities = await helper.readLog(fromDir, enums.LogTypeEnum.Entities);
    errors = await helper.readLog(fromDir, enums.LogTypeEnum.Errors);
    fse.copySync(fromDir, toDir);
  } catch (e) {
    api.logToConsole(e);
  }

  expect(entities.length).toBe(0);
  expect(errors.length).toBe(1);
  expect(errors[0].title).toBe(
    enums.ErTitleEnum.TOO_MANY_DECLARATIONS_FOR_ONE_FIELD
  );
  expect(errors[0].lines[0].line).toBe(4);
});