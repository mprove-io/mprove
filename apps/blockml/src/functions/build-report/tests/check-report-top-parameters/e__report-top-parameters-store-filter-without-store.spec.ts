import test from 'ava';
import * as fse from 'fs-extra';
import { prepareTest } from '~blockml/functions/extra/prepare-test';
import { BmError } from '~blockml/models/bm-error';
import { isDefined } from '~common/functions/is-defined';

let caller = CallerEnum.BuildReport;
let func = FuncEnum.CheckReportTopParameters;
let testId = 'e__report-top-parameters-store-filter-without-store';

test('1', async t => {
  let errors: BmError[];
  let entReports: FileReport[];

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
      type: ConnectionTypeEnum.GoogleApi
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
    entReports = await readLog(fromDir, LogTypeEnum.Entities);
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
  t.is(entReports.length, 0);

  t.is(errors[0].title, ErTitleEnum.TOP_PARAMETERS_STORE_FILTER_WITHOUT_STORE);
  t.is(errors[0].lines[0].line, 5);
});
