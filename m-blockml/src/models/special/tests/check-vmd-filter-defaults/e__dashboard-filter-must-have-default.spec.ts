import test from 'ava';
import * as fse from 'fs-extra';
import { api } from '~/barrels/api';
import { enums } from '~/barrels/enums';
import { helper } from '~/barrels/helper';
import { interfaces } from '~/barrels/interfaces';
import { prepareTest } from '~/functions/prepare-test';
import { BmError } from '~/models/bm-error';

let caller = enums.CallerEnum.BuildDashboard;
let func = enums.FuncEnum.CheckVmdFilterDefaults;
let testId = 'e__dashboard-filter-must-have-default';

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
    entitiesDashboards = await helper.readLog(
      fromDir,
      enums.LogTypeEnum.Entities
    );
    if (helper.isDefined(toDir)) {
      fse.copySync(fromDir, toDir);
    }
  } catch (e) {
    api.logToConsole(e);
  }

  t.is(errors.length, 1);
  t.is(entitiesDashboards.length, 0);

  t.is(errors[0].title, enums.ErTitleEnum.DASHBOARD_FILTER_MUST_HAVE_DEFAULT);
  t.is(errors[0].lines[0].line, 3);
});
