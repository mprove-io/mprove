import * as fse from 'fs-extra';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { isDefined } from '#common/functions/is-defined';
import { ProjectConnection } from '#common/interfaces/backend/project-connection';
import { prepareTest } from '~blockml/functions/extra/prepare-test';

let caller = CallerEnum.RebuildStruct;
let func = FuncEnum.LogStruct;
let testId = 'manual-4';

async function run() {
  let { structService, traceId, structId, dataDir, fromDir, toDir } =
    await prepareTest(caller, func, testId);

  let connection: ProjectConnection = {
    connectionId: 'c1',
    options: {},
    type: ConnectionTypeEnum.PostgreSQL
  };

  await structService.rebuildStruct({
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
