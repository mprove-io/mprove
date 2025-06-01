import test from 'ava';
import * as fse from 'fs-extra';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { logToConsoleBlockml } from '~blockml/functions/log-to-console-blockml';
import { prepareTest } from '~blockml/functions/prepare-test';
import { BmError } from '~blockml/models/bm-error';

let caller = common.CallerEnum.BuildYaml;
let func = common.FuncEnum.CheckConnections;
let testId = 'e__connection-type-mismatch';

test('1', async t => {
  let errors: BmError[];
  let filesAny: any[];

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

    let c1: common.ProjectConnection = {
      connectionId: 'c1',
      type: common.ConnectionTypeEnum.PostgreSQL
    };

    let c2: common.ProjectConnection = {
      connectionId: 'c2',
      type: common.ConnectionTypeEnum.Api
    };

    await structService.rebuildStruct({
      traceId: traceId,
      dir: dataDir,
      structId: structId,
      envId: common.PROJECT_ENV_PROD,
      evs: [],
      connections: [c1, c2],
      overrideTimezone: undefined
    });

    errors = await helper.readLog(fromDir, common.LogTypeEnum.Errors);
    filesAny = await helper.readLog(fromDir, common.LogTypeEnum.FilesAny);
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

  t.is(errors.length, 3);
  t.is(filesAny.length, 1);

  t.is(errors[0].title, common.ErTitleEnum.CONNECTION_TYPE_MISMATCH);
  t.is(errors[0].lines[0].line, 2);

  t.is(errors[1].title, common.ErTitleEnum.CONNECTION_TYPE_MISMATCH);
  t.is(errors[1].lines[0].line, 2);

  t.is(errors[2].title, common.ErTitleEnum.CONNECTION_TYPE_MISMATCH);
  t.is(errors[2].lines[0].line, 2);
});
