import test from 'ava';
import * as fse from 'fs-extra';
import { prepareTest } from '~blockml/functions/extra/prepare-test';
import { BmError } from '~blockml/models/bm-error';
import { isDefined } from '~common/functions/is-defined';

let caller = CallerEnum.BuildYaml;
let func = FuncEnum.CheckTopUnknownParameters;
let testId = 'e__parameter-is-not-a-dictionary';

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

  t.is(errors.length, 1);
  t.is(filesAny.length, 1);

  t.is(errors[0].title, ErTitleEnum.PARAMETER_IS_NOT_A_DICTIONARY);
  t.is(errors[0].lines[0].line, 2);
});
