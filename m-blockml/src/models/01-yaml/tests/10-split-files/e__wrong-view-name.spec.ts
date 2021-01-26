import test from 'ava';
import * as fse from 'fs-extra';
import { api } from '~/barrels/api';
import { enums } from '~/barrels/enums';
import { helper } from '~/barrels/helper';
import { interfaces } from '~/barrels/interfaces';
import { prepareTest } from '~/functions/prepare-test';
import { BmError } from '~/models/bm-error';

let caller = enums.CallerEnum.BuildYaml;
let func = enums.FuncEnum.SplitFiles;
let testId = 'e__wrong-view-name';

test('1', async t => {
  let errors: BmError[];
  let udfs: interfaces.Udf[];
  let views: interfaces.View[];
  let models: interfaces.Model[];
  let dashboards: interfaces.Dashboard[];
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
    udfs = await helper.readLog(fromDir, enums.LogTypeEnum.Udfs);
    views = await helper.readLog(fromDir, enums.LogTypeEnum.Views);
    models = await helper.readLog(fromDir, enums.LogTypeEnum.Models);
    dashboards = await helper.readLog(fromDir, enums.LogTypeEnum.Ds);
    vizs = await helper.readLog(fromDir, enums.LogTypeEnum.Vizs);
    if (helper.isDefined(toDir)) {
      fse.copySync(fromDir, toDir);
    }
  } catch (e) {
    api.logToConsole(e);
  }

  t.is(errors.length, 1);
  t.is(udfs.length, 0);
  t.is(views.length, 0);
  t.is(models.length, 0);
  t.is(dashboards.length, 0);
  t.is(vizs.length, 0);

  t.is(errors[0].title, enums.ErTitleEnum.WRONG_VIEW_NAME);
  t.is(errors[0].lines[0].line, 1);
});
