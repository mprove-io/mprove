import test from 'ava';
import { prepareTest } from '#blockml/functions/top/prepare-test/prepare-test';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import type { ProjectConnection } from '#common/types/backend/parts/project-connection';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';

let caller: Caller = 'BuildYaml';
let func: Func = 'build-yaml/check-schema';
let testId = 'u__schema-column-cache-unique-values';

test('1', async t => {
  let { structService, traceId, structId, dataDir } = await prepareTest({
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

  let prep = await structService.rebuildStructFromDir({
    traceId: traceId,
    dir: dataDir,
    structId: structId,
    envId: PROJECT_ENV_PROD,
    evs: [],
    projectConnections: [connection],
    overrideTimezone: undefined
  });

  t.is(prep.errors.length, 0);
  t.is(prep.extraSchemas[0].tables[0].columns[0].cacheUniqueValues, true);
});
