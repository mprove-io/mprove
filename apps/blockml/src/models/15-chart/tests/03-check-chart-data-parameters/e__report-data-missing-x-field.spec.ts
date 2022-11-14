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
let func = enums.FuncEnum.CheckChartDataParameters;
let testId = 'e__report-data-missing-x-field';

test('1', async t => {
  let errors: BmError[];
  let entDashboards: interfaces.Dashboard[];

  let wLogger;

  try {
    let { structService, traceId, structId, dataDir, fromDir, toDir, logger } =
      await prepareTest(caller, func, testId);

    wLogger = logger;

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
    logToConsoleBlockml({
      log: e,
      logLevel: common.LogLevelEnum.Error,
      logger: wLogger
    });
  }

  t.is(errors.length, 1);
  t.is(entDashboards.length, 0);

  t.is(errors[0].title, enums.ErTitleEnum.REPORT_DATA_MISSING_X_FIELD);
  t.is(errors[0].lines[0].line, 8);
});
