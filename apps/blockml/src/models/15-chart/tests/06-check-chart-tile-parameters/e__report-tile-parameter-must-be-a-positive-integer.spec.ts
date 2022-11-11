import test from 'ava';
import * as fse from 'fs-extra';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { logToConsoleBlockml } from '~blockml/functions/log-to-console-blockml';
import { prepareTest } from '~blockml/functions/prepare-test';
import { BmError } from '~blockml/models/bm-error';

let caller = enums.CallerEnum.BuildDashboardChart;
let func = enums.FuncEnum.CheckChartTileParameters;
let testId = 'e__report-tile-parameter-must-be-a-positive-integer';

test('1', async t => {
  let errors: BmError[];
  let entDashboards: interfaces.Dashboard[];

  try {
    let { structService, traceId, structId, dataDir, fromDir, toDir } =
      await prepareTest(caller, func, testId);

    let connection: common.ProjectConnection = {
      connectionId: 'c1',
      type: common.ConnectionTypeEnum.PostgreSQL
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
    entDashboards = await helper.readLog(fromDir, enums.LogTypeEnum.Entities);
    if (common.isDefined(toDir)) {
      fse.copySync(fromDir, toDir);
    }
  } catch (e) {
    logToConsoleBlockml(e);
  }

  t.is(errors.length, 1);
  t.is(entDashboards.length, 0);

  t.is(
    errors[0].title,
    enums.ErTitleEnum.REPORT_TILE_PARAMETER_MUST_BE_A_POSITIVE_INTEGER
  );
  t.is(errors[0].lines[0].line, 12);
});
