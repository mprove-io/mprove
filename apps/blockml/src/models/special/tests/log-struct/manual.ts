import * as fse from 'fs-extra';
import { common } from '~blockml/barrels/common';
import { prepareTest } from '~blockml/functions/prepare-test';

let caller = common.CallerEnum.RebuildStruct;
let func = common.FuncEnum.LogStruct;
let testId = 'manual-4';

async function run() {
  let { structService, traceId, structId, dataDir, fromDir, toDir } =
    await prepareTest(caller, func, testId);

  let connection: common.ProjectConnection = {
    connectionId: 'c1',
    type: common.ConnectionTypeEnum.PostgreSQL
  };

  await structService.rebuildStruct({
    traceId: traceId,
    dir: dataDir,
    structId: structId,
    envId: common.PROJECT_ENV_PROD,
    evs: [],
    connections: [connection],
    overrideTimezone: undefined
  });

  if (common.isDefined(toDir)) {
    fse.copySync(fromDir, toDir);
  }
}

run();
