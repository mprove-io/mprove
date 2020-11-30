import { api } from '../../../../barrels/api';
import { enums } from '../../../../barrels/enums';
import { interfaces } from '../../../../barrels/interfaces';
import { helper } from '../../../../barrels/helper';
import { prepareTest } from '../../../../functions/prepare-test';
import * as fse from 'fs-extra';

let caller = enums.CallerEnum.BuildSqlAlwaysWhere;
let func = enums.FuncEnum.SawCheckDoubleDeps;
let testId = 'e__sql-always-where-refs-missing-field';

test(testId, async () => {
  let errors: interfaces.BmErrorC[];
  let models: interfaces.Model[];

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

    errors = await helper.readLog(fromDir, enums.LogTypeEnum.Errors);
    models = await helper.readLog(fromDir, enums.LogTypeEnum.Models);
    fse.copySync(fromDir, toDir);
  } catch (e) {
    api.logToConsole(e);
  }

  expect(errors.length).toBe(1);
  expect(models.length).toBe(0);

  expect(errors[0].title).toBe(
    enums.ErTitleEnum.SQL_ALWAYS_WHERE_REFS_MISSING_FIELD
  );
  expect(errors[0].lines[0].line).toBe(3);
});
