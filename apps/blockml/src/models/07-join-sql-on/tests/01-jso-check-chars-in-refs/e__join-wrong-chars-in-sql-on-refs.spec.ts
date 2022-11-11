import test from 'ava';
import * as fse from 'fs-extra';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { logToConsoleBlockml } from '~blockml/functions/log-to-console-blockml';
import { prepareTest } from '~blockml/functions/prepare-test';
import { BmError } from '~blockml/models/bm-error';

let caller = enums.CallerEnum.BuildJoinSqlOn;
let func = enums.FuncEnum.JsoCheckCharsInRefs;
let testId = 'e__join-wrong-chars-in-sql-on-refs';

test('1', async t => {
  let errors: BmError[];
  let models: interfaces.Model[];

  try {
    let { structService, traceId, structId, dataDir, fromDir, toDir } =
      await prepareTest(caller, func, testId);

    let connection: common.ProjectConnection = {
      connectionId: 'c1',
      type: common.ConnectionTypeEnum.BigQuery
    };

    await structService.rebuildStruct({
      traceId: traceId,
      dir: dataDir,
      structId: structId,
      envId: common.PROJECT_ENV_PROD,
      evs: [],
      connections: [connection]
    });

    errors = await helper.readLog(fromDir, enums.LogTypeEnum.Errors);
    models = await helper.readLog(fromDir, enums.LogTypeEnum.Models);
    if (common.isDefined(toDir)) {
      fse.copySync(fromDir, toDir);
    }
  } catch (e) {
    logToConsoleBlockml(e);
  }

  t.is(errors.length, 1);
  t.is(models.length, 0);

  t.is(errors[0].title, enums.ErTitleEnum.JOIN_WRONG_CHARS_IN_SQL_ON_REFS);
  t.is(errors[0].lines[0].line, 9);
});
