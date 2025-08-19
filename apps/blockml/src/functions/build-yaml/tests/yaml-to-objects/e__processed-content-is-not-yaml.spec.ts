import test from 'ava';
import * as fse from 'fs-extra';
import { logToConsoleBlockml } from '~blockml/functions/extra/log-to-console-blockml';
import { prepareTest } from '~blockml/functions/extra/prepare-test';
import { readLog } from '~blockml/functions/extra/read-log';
import { BmError } from '~blockml/models/bm-error';
import { PROJECT_ENV_PROD } from '~common/constants/top';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { CallerEnum } from '~common/enums/special/caller.enum';
import { FuncEnum } from '~common/enums/special/func.enum';
import { LogTypeEnum } from '~common/enums/special/log-type.enum';
import { isDefined } from '~common/functions/is-defined';

let caller = CallerEnum.BuildYaml;
let func = FuncEnum.YamlToObjects;
let testId = 'e__processed-content-is-not-yaml';

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

    await structService.rebuildStruct({
      traceId: traceId,
      dir: dataDir,
      structId: structId,
      envId: PROJECT_ENV_PROD,
      evs: [],
      connections: [],
      overrideTimezone: undefined
    });

    errors = await readLog(fromDir, LogTypeEnum.Errors);
    filesAny = await readLog(fromDir, LogTypeEnum.FilesAny);
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

  // no case for PROCESSED_CONTENT_IS_NOT_YAML yet
  t.is(errors.length, 0);
  t.is(filesAny.length, 2);
});
