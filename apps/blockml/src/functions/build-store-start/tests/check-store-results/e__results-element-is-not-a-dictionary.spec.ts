import test from 'ava';
import * as fse from 'fs-extra';
import { prepareTest } from '~blockml/functions/extra/prepare-test';
import { BmError } from '~blockml/models/bm-error';
import { isDefined } from '~common/functions/is-defined';

let caller = CallerEnum.BuildStoreStart;
let func = FuncEnum.CheckStoreResults;
let testId = 'e__results-element-is-not-a-dictionary';

test('1', async t => {
  let errors: BmError[];
  let entStores: FileStore[];

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

    let connection: ProjectConnection = {
      connectionId: 'c1',
      type: ConnectionTypeEnum.Api
    };

    await structService.rebuildStruct({
      traceId: traceId,
      dir: dataDir,
      structId: structId,
      envId: PROJECT_ENV_PROD,
      evs: [],
      connections: [connection],
      overrideTimezone: undefined
    });

    errors = await readLog(fromDir, LogTypeEnum.Errors);
    entStores = await readLog(fromDir, LogTypeEnum.Stores);
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
  t.is(entStores.length, 0);

  t.is(errors[0].title, ErTitleEnum.RESULTS_ELEMENT_IS_NOT_A_DICTIONARY);
  t.is(errors[0].lines[0].line, 4);
});
