import { api } from '../../../../barrels/api';
import { enums } from '../../../../barrels/enums';
import { interfaces } from '../../../../barrels/interfaces';
import { helper } from '../../../../barrels/helper';
import { prepareTest } from '../../../../functions/prepare-test';
import * as fse from 'fs-extra';

let caller = enums.CallerEnum.FieldBuildViews;
let func = enums.FuncEnum.CheckMeasures;
let testId = 'e__measure-sql-key-missing-blockml-reference';

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
      type: api.ConnectionTypeEnum.BigQuery
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
    enums.ErTitleEnum.MEASURE_SQL_KEY_MISSING_BLOCKML_REFERENCE
  );
  expect(errors[0].lines[0].line).toBe(7);
});
