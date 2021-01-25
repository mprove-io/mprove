import { api } from '~/barrels/api';
import { enums } from '~/barrels/enums';
import { interfaces } from '~/barrels/interfaces';
import { helper } from '~/barrels/helper';
import { prepareTest } from '~/functions/prepare-test';
import test from 'ava';
import { BmError } from '~/models/bm-error';
import * as fse from 'fs-extra';

let caller = enums.CallerEnum.BuildModel;
let func = enums.FuncEnum.CheckFieldsDoubleDeps;
let testId = 'e__model-field-refs-not-valid-field';

test('1', async t => {
  let errors: BmError[];
  let models: interfaces.Model[];

  try {
    let {
      structService,
      traceId,
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
      traceId: traceId,
      dir: dataDir,
      structId: structId,
      connections: [connection],
      weekStart: api.ProjectWeekStartEnum.Monday
    });

    errors = await helper.readLog(fromDir, enums.LogTypeEnum.Errors);
    models = await helper.readLog(fromDir, enums.LogTypeEnum.Models);
    if (helper.isDefined(toDir)) {
      fse.copySync(fromDir, toDir);
    }
  } catch (e) {
    api.logToConsole(e);
  }

  t.is(errors.length, 1);
  t.is(models.length, 0);

  t.is(errors[0].title, enums.ErTitleEnum.MODEL_FIELD_REFS_NOT_VALID_FIELD);
  t.is(errors[0].lines[0].line, 9);
});
