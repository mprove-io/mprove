import test from 'ava';
import * as fse from 'fs-extra';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { logToConsoleBlockml } from '~blockml/functions/log-to-console-blockml';
import { prepareTest } from '~blockml/functions/prepare-test';
import { BmError } from '~blockml/models/bm-error';

let caller = enums.CallerEnum.BuildYaml;
let func = enums.FuncEnum.SplitFiles;
let testId = 'e__wrong-model-name';

test('1', async t => {
  let errors: BmError[];
  let udfs: interfaces.Udf[];
  let views: interfaces.View[];
  let models: interfaces.Model[];
  let dashboards: interfaces.Dashboard[];
  let vizs: interfaces.Viz[];

  let wLogger;
  let configService;

  try {
    let {
      structService,
      traceId,
      structId,
      dataDir,
      fromDir,
      toDir,
      logger,
      cs
    } = await prepareTest(caller, func, testId);

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
    udfs = await helper.readLog(fromDir, enums.LogTypeEnum.Udfs);
    views = await helper.readLog(fromDir, enums.LogTypeEnum.Views);
    models = await helper.readLog(fromDir, enums.LogTypeEnum.Models);
    dashboards = await helper.readLog(fromDir, enums.LogTypeEnum.Ds);
    vizs = await helper.readLog(fromDir, enums.LogTypeEnum.Vizs);
    if (common.isDefined(toDir)) {
      fse.copySync(fromDir, toDir);
    }
  } catch (e) {
    logToConsoleBlockml({
      log: e,
      logLevel: common.LogLevelEnum.Error,
      logger: wLogger,
      cs: configService
    });
  }

  t.is(errors.length, 1);
  t.is(udfs.length, 0);
  t.is(views.length, 0);
  t.is(models.length, 0);
  t.is(dashboards.length, 0);
  t.is(vizs.length, 0);

  t.is(errors[0].title, enums.ErTitleEnum.WRONG_MODEL_NAME);
  t.is(errors[0].lines[0].line, 1);
});
