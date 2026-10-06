import test from 'ava';
import fse from 'fs-extra';
import type { BmError } from '#blockml/classes/bm-error/bm-error';
import { readLog } from '#blockml/functions/read-log/read-log';
import { prepareTest } from '#blockml/functions/top/prepare-test/prepare-test';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';

let caller: Caller = 'BuildYaml';
let func: Func = 'build-yaml/check-top-unknown-parameters';
let testId = 'e__space-access-roles-is-not-a-list';

test('1', async t => {
  let { structService, traceId, structId, dataDir, fromDir, toDir } =
    await prepareTest({
      caller: caller,
      func: func,
      testId: testId,
      testsDir: import.meta.dirname
    });

  await structService.rebuildStructFromDir({
    traceId: traceId,
    dir: dataDir,
    structId: structId,
    envId: PROJECT_ENV_PROD,
    evs: [],
    projectConnections: [],
    overrideTimezone: undefined
  });

  let errors: BmError[] = await readLog(fromDir, 'out_errors.log');
  let filesAny: any[] = await readLog(fromDir, 'out_filesAny.log');
  let isToDirDefined = isDefined(toDir);
  if (isToDirDefined) {
    fse.copySync(fromDir, toDir);
  }

  t.is(errors.length, 1);
  t.is(filesAny.length, 1);
  t.is(errors[0].title, 'PARAMETER_IS_NOT_A_LIST');
  t.is(errors[0].lines[0].line, 2);
});
