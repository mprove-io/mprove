import test from 'ava';
import * as fse from 'fs-extra';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { ErTitleEnum } from '#common/enums/special/er-title.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { isDefined } from '#common/functions/is-defined';
import { File3 } from '#common/interfaces/blockml/internal/file-3';
import { logToConsoleBlockml } from '~blockml/functions/extra/log-to-console-blockml';
import { prepareTest } from '~blockml/functions/extra/prepare-test';
import { readLog } from '~blockml/functions/extra/read-log';
import { BmError } from '~blockml/models/bm-error';

let caller = CallerEnum.BuildYaml;
let func = FuncEnum.DeduplicateFileNames;
let testId = 'e__duplicate-file-names';

test('1', async t => {
  let errors: BmError[];
  let file3s: File3[];

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
    file3s = await readLog(fromDir, LogTypeEnum.File3s);
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
  t.is(file3s.length, 1);

  t.is(errors[0].title, ErTitleEnum.DUPLICATE_FILE_NAMES);
  t.is(errors[0].lines.length, 3);
  t.is(errors[0].lines[0].line, 0);
});
