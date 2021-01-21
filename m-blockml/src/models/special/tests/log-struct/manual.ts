import { prepareTest } from '../../../../functions/prepare-test';
import test from 'ava';
import { api } from '../../../../barrels/api';
import { enums } from '../../../../barrels/enums';
import * as fse from 'fs-extra';
import { helper } from '../../../../barrels/helper';

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

  let connection: api.ProjectConnection = {
    name: 'c1',
    type: api.ConnectionTypeEnum.PostgreSQL
  };

  await structService.rebuildStruct({
    traceId: traceId,
    dir: dataDir,
    structId: structId,
    connections: [connection],
    weekStart: api.ProjectWeekStartEnum.Monday
  });

  if (helper.isDefined(toDir)) {
    fse.copySync(fromDir, toDir);
  }
}

run();
