import test from 'ava';
import { prepareTest } from '#blockml/functions/extra/prepare-test';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import type { ProjectConnection } from '#common/zod/backend/project-connection';

let caller = CallerEnum.BuildYaml;
let func = FuncEnum.CheckSchema;
let testId = 'u__schema-column-cache-unique-values';

test('1', async t => {
  let { structService, traceId, structId, dataDir } = await prepareTest(
    caller,
    func,
    testId
  );

  let connection: ProjectConnection = {
    connectionId: 'c1',
    options: {},
    type: ConnectionTypeEnum.PostgreSQL
  };

  let prep = await structService.rebuildStruct({
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
