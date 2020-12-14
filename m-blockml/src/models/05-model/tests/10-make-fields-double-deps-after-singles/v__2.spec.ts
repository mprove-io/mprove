import { api } from '../../../../barrels/api';
import { enums } from '../../../../barrels/enums';
import { interfaces } from '../../../../barrels/interfaces';
import { helper } from '../../../../barrels/helper';
import { prepareTest } from '../../../../functions/prepare-test';
import { BmError } from '../../../../models/bm-error';
import * as fse from 'fs-extra';

let caller = enums.CallerEnum.BuildModel;
let func = enums.FuncEnum.MakeFieldsDoubleDepsAfterSingles;
let testId = 'v__2';

test(testId, async () => {
  let errors: BmError[];
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
      connections: [connection],
      weekStart: api.ProjectWeekStartEnum.Monday
    });

    errors = await helper.readLog(fromDir, enums.LogTypeEnum.Errors);
    models = await helper.readLog(fromDir, enums.LogTypeEnum.Models);
    fse.copySync(fromDir, toDir);
  } catch (e) {
    api.logToConsole(e);
  }

  expect(errors.length).toBe(0);
  expect(models.length).toBe(1);
  expect(models[0].fields[0].sqlReal).toBe('${a.dim1} + m10');
  expect(models[0].fields[0].sqlKeyReal).toBe('${a.dim2} + m10');
  expect(models[0].fieldsDoubleDepsAfterSingles).toStrictEqual({
    mea10: {
      a: {
        dim1: 9,
        dim2: 10
      }
    }
  });
});
