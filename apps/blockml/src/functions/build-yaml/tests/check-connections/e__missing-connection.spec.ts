import test from 'ava';
import * as fse from 'fs-extra';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { ErTitleEnum } from '#common/enums/special/er-title.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { isDefined } from '#common/functions/is-defined';
import { logToConsoleBlockml } from '~blockml/functions/extra/log-to-console-blockml';
import { prepareTest } from '~blockml/functions/extra/prepare-test';
import { readLog } from '~blockml/functions/extra/read-log';
import { BmError } from '~blockml/models/bm-error';

let caller = CallerEnum.BuildYaml;
let func = FuncEnum.CheckConnections;
let testId = 'e__missing-connection';

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
      projectConnections: [],
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

  t.is(errors.length, 1);
  t.is(filesAny.length, 1);

  t.is(errors[0].title, ErTitleEnum.MISSING_CONNECTION);
  t.is(errors[0].lines[0].line, 0);
});
