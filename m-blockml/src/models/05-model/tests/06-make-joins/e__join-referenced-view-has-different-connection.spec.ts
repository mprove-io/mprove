import { api } from '../../../../barrels/api';
import { enums } from '../../../../barrels/enums';
import { interfaces } from '../../../../barrels/interfaces';
import { helper } from '../../../../barrels/helper';
import { prepareTest } from '../../../../functions/prepare-test';
import test from 'ava';
import { BmError } from '../../../../models/bm-error';
import * as fse from 'fs-extra';

let caller = enums.CallerEnum.BuildModel;
let func = enums.FuncEnum.MakeJoins;
let testId = 'e__join-referenced-view-has-different-connection';

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

    let c1: api.ProjectConnection = {
      name: 'c1',
      type: api.ConnectionTypeEnum.BigQuery
    };

    let c2: api.ProjectConnection = {
      name: 'c2',
      type: api.ConnectionTypeEnum.BigQuery
    };

    await structService.rebuildStruct({
      traceId: traceId,
      dir: dataDir,
      structId: structId,
      connections: [c1, c2],
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

  t.is(errors.length, 2);
  t.is(models.length, 0);

  t.is(
    errors[0].title,
    enums.ErTitleEnum.JOIN_REFERENCED_VIEW_HAS_DIFFERENT_CONNECTION
  );
  t.is(errors[0].lines[0].line, 4);

  t.is(
    errors[1].title,
    enums.ErTitleEnum.JOIN_REFERENCED_VIEW_HAS_DIFFERENT_CONNECTION
  );
  t.is(errors[1].lines[0].line, 7);
});
