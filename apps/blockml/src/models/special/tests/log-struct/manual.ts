import * as fse from 'fs-extra';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { prepareTest } from '~blockml/functions/prepare-test';

let caller = enums.CallerEnum.RebuildStruct;
let func = enums.FuncEnum.LogStruct;
let testId = 'manual-4';

async function run() {
  let {
    structService,
    traceId,
    structId,
    dataDir,
    fromDir,
    toDir
  } = await prepareTest(caller, func, testId);

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
    connections: [connection]
  });

  if (common.isDefined(toDir)) {
    fse.copySync(fromDir, toDir);
  }
}

run();
