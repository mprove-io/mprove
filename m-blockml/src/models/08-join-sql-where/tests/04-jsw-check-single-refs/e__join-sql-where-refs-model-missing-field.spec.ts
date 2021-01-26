import test from 'ava';
import * as fse from 'fs-extra';
import { api } from '~/barrels/api';
import { enums } from '~/barrels/enums';
import { helper } from '~/barrels/helper';
import { interfaces } from '~/barrels/interfaces';
import { prepareTest } from '~/functions/prepare-test';
import { BmError } from '~/models/bm-error';

let caller = enums.CallerEnum.BuildJoinSqlWhere;
let func = enums.FuncEnum.JswCheckSingleRefs;
let testId = 'e__join-sql-where-refs-model-missing-field';

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

  t.is(
    errors[0].title,
    enums.ErTitleEnum.JOIN_SQL_WHERE_REFS_MODEL_MISSING_FIELD
  );
  t.is(errors[0].lines[0].line, 10);
});
