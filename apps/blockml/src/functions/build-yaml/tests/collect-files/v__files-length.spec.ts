import test from 'ava';
import * as fse from 'fs-extra';
import { prepareTest } from '~blockml/functions/extra/prepare-test';
import { isDefined } from '~common/functions/is-defined';

let caller = CallerEnum.RebuildStruct;
let func = FuncEnum.CollectFiles;
let testId = 'v__files-length';

test('1', async t => {
  let files: BmlFile[];

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
    configService = cs;

    await structService.rebuildStruct({
      traceId: traceId,
      dir: dataDir,
      structId: structId,
      envId: PROJECT_ENV_PROD,
      evs: [],
      connections: [],
      overrideTimezone: undefined
    });

    files = await readLog(fromDir, LogTypeEnum.Files);
    if (isDefined(toDir)) {
      fse.copySync(fromDir, toDir);
    }
  } catch (e) {
    logToConsoleBlockml({
      log: e,
      logLevel: LogLevelEnum.Error,
      logger: wLogger,
      cs: configService
    });
  }

  t.is(files.length, 4);
});
