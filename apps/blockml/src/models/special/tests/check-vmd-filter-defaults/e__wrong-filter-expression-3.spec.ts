import test from 'ava';
import * as fse from 'fs-extra';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { prepareTest } from '~blockml/functions/prepare-test';
import { BmError } from '~blockml/models/bm-error';

let caller = enums.CallerEnum.BuildDashboard;
let func = enums.FuncEnum.CheckVmdFilterDefaults;
let testId = 'e__wrong-filter-expression-3';

test('1', async t => {
  let errors: BmError[];
  let entitiesDashboards: interfaces.Dashboard[];

  try {
    let {
      structService,
      traceId,
      structId,
      dataDir,
      fromDir,
      toDir
    } = await prepareTest(caller, func, testId);

    let connection: common.ProjectConnection = {
      name: 'c1',
      type: common.ConnectionTypeEnum.PostgreSQL
    };

    await structService.rebuildStruct({
      traceId: traceId,
      dir: dataDir,
      structId: structId,
      connections: [connection],
      weekStart: common.ProjectWeekStartEnum.Monday
    });

    errors = await helper.readLog(fromDir, enums.LogTypeEnum.Errors);
    entitiesDashboards = await helper.readLog(
      fromDir,
      enums.LogTypeEnum.Entities
    );
    if (helper.isDefined(toDir)) {
      fse.copySync(fromDir, toDir);
    }
  } catch (e) {
    common.logToConsole(e);
  }

  t.is(errors.length, 1);
  t.is(entitiesDashboards.length, 0);

  t.is(errors[0].title, enums.ErTitleEnum.WRONG_FILTER_EXPRESSION);
  t.is(errors[0].lines[0].line, 5);
});
