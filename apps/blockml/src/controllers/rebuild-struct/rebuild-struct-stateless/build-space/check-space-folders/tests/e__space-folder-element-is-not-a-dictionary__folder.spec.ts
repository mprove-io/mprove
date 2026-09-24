import test from 'ava';
import fse from 'fs-extra';
import { BmError } from '#blockml/classes/bm-error';
import { logToConsoleBlockml } from '#blockml/functions/log-to-console-blockml/log-to-console-blockml';
import { prepareTest } from '#blockml/functions/prepare-test/prepare-test';
import { readLog } from '#blockml/functions/read-log/read-log';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { ErTitleEnum } from '#common/enums/special/er-title.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { isDefined } from '#common/functions/is-defined';

let caller = CallerEnum.BuildSpace;
let func = FuncEnum.CheckSpaceFolders;
let testId = 'e__space-folder-element-is-not-a-dictionary__folder';

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
    } = await prepareTest({
      caller: caller,
      func: func,
      testId: testId,
      testsDir: import.meta.dirname
    });
    wLogger = logger;
    configService = cs;

    await structService.rebuildStructFromDir({
      traceId: traceId,
      dir: dataDir,
      structId: structId,
      envId: PROJECT_ENV_PROD,
      evs: [],
      projectConnections: [],
      overrideTimezone: undefined
    });

    errors = await readLog(fromDir, LogTypeEnum.Errors);
    filesAny = await readLog(fromDir, LogTypeEnum.Spaces);
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
  t.is(filesAny.length, 0);
  t.is(errors[0].title, ErTitleEnum.SPACE_FOLDER_ELEMENT_IS_NOT_A_DICTIONARY);
  t.is(errors[0].lines[0].line, 2);
});
