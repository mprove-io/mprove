import test from 'ava';
import * as fse from 'fs-extra';
import { api } from '~/barrels/api';
import { enums } from '~/barrels/enums';
import { helper } from '~/barrels/helper';
import { interfaces } from '~/barrels/interfaces';
import { prepareTest } from '~/functions/prepare-test';
import { BmError } from '~/models/bm-error';

let caller = enums.CallerEnum.BuildViewField;
let func = enums.FuncEnum.CheckFieldUnknownParameters;
let testId = 'e__wrong-field-hidden';

test('1', async t => {
  let errors: BmError[];
  let entViews: interfaces.View[];

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
      type: api.ConnectionTypeEnum.PostgreSQL
    };

    await structService.rebuildStruct({
      traceId: traceId,
      dir: dataDir,
      structId: structId,
      connections: [connection],
      weekStart: api.ProjectWeekStartEnum.Monday
    });

    errors = await helper.readLog(fromDir, enums.LogTypeEnum.Errors);
    entViews = await helper.readLog(fromDir, enums.LogTypeEnum.Entities);
    if (helper.isDefined(toDir)) {
      fse.copySync(fromDir, toDir);
    }
  } catch (e) {
    api.logToConsole(e);
  }

  t.is(errors.length, 1);
  t.is(entViews.length, 0);

  t.is(errors[0].title, enums.ErTitleEnum.WRONG_FIELD_HIDDEN);
  t.is(errors[0].lines[0].line, 6);
});
