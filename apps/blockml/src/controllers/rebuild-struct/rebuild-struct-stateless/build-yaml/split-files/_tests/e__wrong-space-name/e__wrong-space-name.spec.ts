import test from 'ava';
import fse from 'fs-extra';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import { readLog } from '#blockml/functions/read-log/read-log';
import { logToConsoleBlockml } from '#blockml/functions/top/log-to-console-blockml/log-to-console-blockml';
import { prepareTest } from '#blockml/functions/top/prepare-test/prepare-test';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { FileSpace } from '#common/types/blockml/parts/internal/file-space';

let caller: Caller = 'BuildYaml';
let func: Func = 'build-yaml/split-files';
let testId = 'e__wrong-space-name';

test('1', async t => {
  let errors: BmError[];
  let spaces: FileSpace[];
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

    errors = await readLog(fromDir, 'out_errors.log');
    spaces = await readLog(fromDir, 'out_filesAny.log');
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
  t.is(spaces.length, 0);
  t.is(errors[0].title, 'WRONG_SPACE_NAME');
  t.is(errors[0].lines[0].line, 1);
});
