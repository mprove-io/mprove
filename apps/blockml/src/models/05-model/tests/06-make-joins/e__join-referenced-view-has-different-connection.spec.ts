import test from 'ava';
import * as fse from 'fs-extra';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { logToConsoleBlockml } from '~blockml/functions/log-to-console-blockml';
import { prepareTest } from '~blockml/functions/prepare-test';
import { BmError } from '~blockml/models/bm-error';

let caller = enums.CallerEnum.BuildModel;
let func = enums.FuncEnum.MakeJoins;
let testId = 'e__join-referenced-view-has-different-connection';

test('1', async t => {
  let errors: BmError[];
  let models: interfaces.Model[];

  try {
    let { structService, traceId, structId, dataDir, fromDir, toDir } =
      await prepareTest(caller, func, testId);

    let c1: common.ProjectConnection = {
      connectionId: 'c1',
      type: common.ConnectionTypeEnum.BigQuery
    };

    let c2: common.ProjectConnection = {
      connectionId: 'c2',
      type: common.ConnectionTypeEnum.BigQuery
    };

    await structService.rebuildStruct({
      traceId: traceId,
      dir: dataDir,
      structId: structId,
      envId: common.PROJECT_ENV_PROD,
      evs: [],
      connections: [c1, c2]
    });

    errors = await helper.readLog(fromDir, enums.LogTypeEnum.Errors);
    models = await helper.readLog(fromDir, enums.LogTypeEnum.Models);
    if (common.isDefined(toDir)) {
      fse.copySync(fromDir, toDir);
    }
  } catch (e) {
    logToConsoleBlockml(e);
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
