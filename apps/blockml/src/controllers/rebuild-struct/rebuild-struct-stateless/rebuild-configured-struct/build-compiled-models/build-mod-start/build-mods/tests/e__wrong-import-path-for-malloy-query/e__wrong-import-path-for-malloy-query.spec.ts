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
import type { FileMod } from '#common/types/blockml/parts/internal/file-mod';

let caller: Caller = 'BuildModStart';
let func: Func = 'build-mod-start/build-mods';
let testId = 'e__wrong-import-path-for-malloy-query';

test('1', async t => {
  let errors: BmError[];
  let entMods: FileMod[];

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
    entMods = await readLog(fromDir, 'out_mods.log');

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

  t.is(errors.length > 0, true);
  t.is(errors[0].title, 'WRONG_IMPORT_PATH_FOR_MALLOY_FILE');
});
