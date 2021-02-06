import test from 'ava';
import * as fse from 'fs-extra';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { prepareTest } from '~blockml/functions/prepare-test';
import { BmError } from '~blockml/models/bm-error';

let caller = enums.CallerEnum.BuildSqlAlwaysWhereCalc;
let func = enums.FuncEnum.AwcCheckApplyFilter;
let testId = 'e__sql-always-where-calc-apply-filter-must-reference-a-filter';

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

    let connection: common.ProjectConnection = {
      name: 'c1',
      type: common.ConnectionTypeEnum.BigQuery
    };

    await structService.rebuildStruct({
      traceId: traceId,
      dir: dataDir,
      structId: structId,
      connections: [connection],
      weekStart: common.ProjectWeekStartEnum.Monday
    });

    errors = await helper.readLog(fromDir, enums.LogTypeEnum.Errors);
    models = await helper.readLog(fromDir, enums.LogTypeEnum.Models);
    if (helper.isDefined(toDir)) {
      fse.copySync(fromDir, toDir);
    }
  } catch (e) {
    common.logToConsole(e);
  }

  t.is(errors.length, 1);
  t.is(models.length, 0);

  t.is(
    errors[0].title,
    enums.ErTitleEnum.SQL_ALWAYS_WHERE_CALC_APPLY_FILTER_MUST_REFERENCE_A_FILTER
  );
  t.is(errors[0].lines[0].line, 3);
});
