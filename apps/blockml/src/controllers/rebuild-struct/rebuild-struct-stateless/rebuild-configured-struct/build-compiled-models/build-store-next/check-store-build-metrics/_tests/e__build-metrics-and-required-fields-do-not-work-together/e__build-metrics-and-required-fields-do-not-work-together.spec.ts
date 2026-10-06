import test from 'ava';
import fse from 'fs-extra';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import { readLog } from '#blockml/functions/read-log/read-log';
import { logToConsoleBlockml } from '#blockml/functions/top/log-to-console-blockml/log-to-console-blockml';
import { prepareTest } from '#blockml/functions/top/prepare-test/prepare-test';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { ProjectConnection } from '#common/types/backend/parts/project-connection';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { FileStore } from '#common/types/blockml/parts/internal/file-store';

let caller: Caller = 'BuildStoreNext';
let func: Func = 'build-store-next/check-store-build-metrics';
let testId = 'e__build-metrics-and-required-fields-do-not-work-together';

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
      type: 'Api'
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

    errors = await readLog(fromDir, 'out_errors.log');
    entStores = await readLog(fromDir, 'out_stores.log');
    if (isDefined(toDir)) {
      fse.copySync(fromDir, toDir);
    }
  } catch (e) {
    logToConsoleBlockml({
      log: e,
      logLevel: 'Error',
      logger: wLogger,
      cs: configService
    });
  }

  t.is(errors.length, 1);
  t.is(entStores.length, 0);

  t.is(
    errors[0].title,
    'BUILD_METRICS_AND_REQUIRED_FIELDS_DO_NOT_WORK_TOGETHER'
  );
  t.is(errors[0].lines[0].line, 6);
  t.is(errors[0].lines[1].line, 19);
  t.is(errors[0].lines[2].line, 27);
});
