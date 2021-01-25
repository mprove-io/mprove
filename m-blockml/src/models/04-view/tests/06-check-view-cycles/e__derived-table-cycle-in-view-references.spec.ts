import { api } from '~/barrels/api';
import { enums } from '~/barrels/enums';
import { interfaces } from '~/barrels/interfaces';
import { helper } from '~/barrels/helper';
import { prepareTest } from '~/functions/prepare-test';
import test from 'ava';
import { BmError } from '~/models/bm-error';
import * as fse from 'fs-extra';

let caller = enums.CallerEnum.BuildView;
let func = enums.FuncEnum.CheckViewCycles;
let testId = 'e__derived-table-cycle-in-view-references';

test('1', async t => {
  let errors: BmError[];
  let views: interfaces.View[];

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
    views = await helper.readLog(fromDir, enums.LogTypeEnum.Views);
    if (helper.isDefined(toDir)) {
      fse.copySync(fromDir, toDir);
    }
  } catch (e) {
    api.logToConsole(e);
  }

  t.is(errors.length, 2);
  t.is(views.length, 0);

  t.is(
    errors[0].title,
    enums.ErTitleEnum.DERIVED_TABLE_CYCLE_IN_VIEW_REFERENCES
  );
  t.is(errors[0].lines.length, 3);
  t.is(errors[0].lines[0].line, 3);
});
