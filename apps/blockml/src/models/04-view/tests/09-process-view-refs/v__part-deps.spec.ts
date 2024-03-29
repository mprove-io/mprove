import test from 'ava';
import * as fse from 'fs-extra';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { logToConsoleBlockml } from '~blockml/functions/log-to-console-blockml';
import { prepareTest } from '~blockml/functions/prepare-test';
import { BmError } from '~blockml/models/bm-error';

let caller = enums.CallerEnum.BuildView;
let func = enums.FuncEnum.ProcessViewRefs;
let testId = 'v__part-deps';

test('1', async t => {
  let errors: BmError[];
  let views: interfaces.View[];

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
      connections: [connection]
    });

    errors = await helper.readLog(fromDir, enums.LogTypeEnum.Errors);
    views = await helper.readLog(fromDir, enums.LogTypeEnum.Views);
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
  t.is(views.length, 5);

  let v4 = views[3];
  t.deepEqual(Object.keys(v4.parts).sort(), [
    'v2__v1__a',
    'v3__v1__b',
    'v4__v2__c',
    'v4__v3__d'
  ]);
  t.deepEqual(Object.keys(v4.parts['v4__v2__c'].deps).sort(), ['v2__v1__a']);
  t.deepEqual(Object.keys(v4.parts['v4__v3__d'].deps).sort(), ['v3__v1__b']);

  let v5 = views[4];
  t.deepEqual(Object.keys(v5.parts).sort(), [
    'v2__v1__a',
    'v3__v1__b',
    'v4__v2__c',
    'v4__v3__d',
    'v5__v4__e',
    'v5__v4__f'
  ]);
  t.deepEqual(Object.keys(v5.parts['v5__v4__e'].deps).sort(), [
    'v4__v2__c',
    'v4__v3__d'
  ]);
  t.deepEqual(Object.keys(v5.parts['v5__v4__f'].deps).sort(), [
    'v4__v2__c',
    'v4__v3__d'
  ]);
});
