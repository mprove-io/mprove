import fse from 'fs-extra';
import { prepareTest } from '#blockml/functions/top/prepare-test/prepare-test';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { ProjectConnection } from '#common/types/backend/parts/project-connection';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';

let caller: Caller = 'RebuildStruct';
let func: Func = 'extra/log-struct';
let testId = 'manual-1';

async function run() {
  let { structService, traceId, structId, dataDir, fromDir, toDir } =
    await prepareTest({
      caller: caller,
      func: func,
      testId: testId,
      testsDir: import.meta.dirname
    });

  let connection: ProjectConnection = {
    connectionId: 'c1',
    options: {},
    type: 'PostgreSQL'
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

  if (isDefined(toDir)) {
    fse.copySync(fromDir, toDir);
  }
}

run();
