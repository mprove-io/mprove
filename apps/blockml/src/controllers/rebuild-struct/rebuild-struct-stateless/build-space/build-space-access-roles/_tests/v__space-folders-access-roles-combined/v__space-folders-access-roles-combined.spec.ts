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
import type { FilePartSpace } from '#common/types/blockml/parts/internal/file-part-space';

let caller: Caller = 'BuildSpace';
let func: Func = 'build-spaces/build-space-access-roles';
let testId = 'v__space-folders-access-roles-combined';

test('1', async t => {
  let errors: BmError[];
  let spaces: FilePartSpace[];

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
    spaces = await readLog(fromDir, 'out_spaces.log');
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

  t.is(errors.length, 0);
  t.deepEqual(spaces[0].accessRolesCombined, [{ role: 'r1', isDirect: true }]);
  t.deepEqual(spaces[1].accessRolesCombined, [
    { role: 'r2', isDirect: true },
    { role: 'r1', isDirect: false }
  ]);
  t.deepEqual(spaces[2].accessRolesCombined, [
    { role: 'r2', isDirect: false },
    { role: 'r1', isDirect: false }
  ]);
});
