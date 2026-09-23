import test from 'ava';
import fse from 'fs-extra';
import { BmError } from '#blockml/classes/bm-error';
import { readLog } from '#blockml/functions/extra/read-log';
import { logToConsoleBlockml } from '#blockml/functions/log-to-console-blockml';
import { prepareTest } from '#blockml/functions/prepare-test/prepare-test';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { ErTitleEnum } from '#common/enums/special/er-title.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { isDefined } from '#common/functions/is-defined';
import type { ProjectConnection } from '#common/zod/backend/project-connection';
import type { FileReport } from '#common/zod/blockml/internal/file-report';

let caller = CallerEnum.BuildReport;
let func = FuncEnum.CheckReportTopParameters;
let testId = 'e__report-fraction-missing-logic';

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
    } = await prepareTest({
      caller: caller,
      func: func,
      testId: testId,
      testsDir: import.meta.dirname
    });

    wLogger = logger;

    let connection: ProjectConnection = {
      connectionId: 'c1',
      options: {},
      type: ConnectionTypeEnum.GoogleApi
    };

    await structService.rebuildStructFromDir({
      traceId: traceId,
      dir: dataDir,
      structId: structId,
      envId: PROJECT_ENV_PROD,
      evs: [],
      projectConnections: [connection],
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

  t.is(errors[0].title, ErTitleEnum.FRACTION_MISSING_LOGIC);
  t.is(errors[0].lines[0].line, 8);
});
