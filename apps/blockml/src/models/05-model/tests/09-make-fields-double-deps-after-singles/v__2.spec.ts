import test from 'ava';
import * as fse from 'fs-extra';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { logToConsoleBlockml } from '~blockml/functions/log-to-console-blockml';
import { prepareTest } from '~blockml/functions/prepare-test';
import { BmError } from '~blockml/models/bm-error';

let caller = common.CallerEnum.BuildModel;
let func = common.FuncEnum.MakeFieldsDoubleDepsAfterSingles;
let testId = 'v__2';

test('1', async t => {
  let errors: BmError[];
  let models: common.FileModel[];

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
      type: common.ConnectionTypeEnum.BigQuery
    };

    await structService.rebuildStruct({
      traceId: traceId,
      dir: dataDir,
      structId: structId,
      envId: common.PROJECT_ENV_PROD,
      evs: [],
      connections: [connection],
      overrideTimezone: undefined
    });

    errors = await helper.readLog(fromDir, common.LogTypeEnum.Errors);
    models = await helper.readLog(fromDir, common.LogTypeEnum.Models);
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

  t.is(errors.length, 0);
  t.is(models.filter(x => x.isViewModel === false).length, 1);
  t.is(
    models.filter(x => x.isViewModel === false)[0].fields[0].sqlReal,
    '${a.dim1} + m10'
  );
  t.is(
    models.filter(x => x.isViewModel === false)[0].fields[0].sqlKeyReal,
    '${a.dim2} + m10'
  );
  t.deepEqual(models[0].fieldsDoubleDepsAfterSingles, {
    mea10: {
      a: {
        dim1: 9,
        dim2: 10
      }
    }
  });
});
