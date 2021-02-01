import test from 'ava';
import * as fse from 'fs-extra';
import { api } from '~blockml/barrels/api';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { prepareTest } from '~blockml/functions/prepare-test';
import { BmError } from '~blockml/models/bm-error';

let caller = enums.CallerEnum.BuildViz;
let func = enums.FuncEnum.CheckVizReportsExist;
let testId = 'e__viz-missing-reports';

test('1', async t => {
  let errors: BmError[];
  let vizs: interfaces.Viz[];

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
    vizs = await helper.readLog(fromDir, enums.LogTypeEnum.Vizs);
    if (helper.isDefined(toDir)) {
      fse.copySync(fromDir, toDir);
    }
  } catch (e) {
    api.logToConsole(e);
  }

  t.is(errors.length, 1);
  t.is(vizs.length, 0);

  t.is(errors[0].title, enums.ErTitleEnum.VIZ_MISSING_REPORTS);
  t.is(errors[0].lines[0].line, 1);
});
