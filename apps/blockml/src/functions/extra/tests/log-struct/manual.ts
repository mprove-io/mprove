import fse from 'fs-extra';
import { prepareTest } from '#blockml/functions/prepare-test/prepare-test';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { isDefined } from '#common/functions/is-defined';
import type { ProjectConnection } from '#common/zod/backend/project-connection';

let caller = CallerEnum.RebuildStruct;
let func = FuncEnum.LogStruct;
let testId = 'manual-4';

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
    type: ConnectionTypeEnum.PostgreSQL
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
