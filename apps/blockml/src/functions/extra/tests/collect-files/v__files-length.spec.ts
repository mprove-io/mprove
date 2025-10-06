import test from 'ava';
import * as fse from 'fs-extra';
import { logToConsoleBlockml } from '~blockml/functions/extra/log-to-console-blockml';
import { prepareTest } from '~blockml/functions/extra/prepare-test';
import { readLog } from '~blockml/functions/extra/read-log';
import { PROJECT_ENV_PROD } from '~common/constants/top';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { CallerEnum } from '~common/enums/special/caller.enum';
import { FuncEnum } from '~common/enums/special/func.enum';
import { LogTypeEnum } from '~common/enums/special/log-type.enum';
import { isDefined } from '~common/functions/is-defined';
import { BmlFile } from '~common/interfaces/blockml/bml-file';

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
      projectConnections: [],
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
