import { api } from '../../../../barrels/api';
import { enums } from '../../../../barrels/enums';
import { interfaces } from '../../../../barrels/interfaces';
import { helper } from '../../../../barrels/helper';
import { prepareTest } from '../../../../functions/prepare-test';
import { BmError } from '../../../../models/bm-error';
import * as fse from 'fs-extra';

let caller = enums.CallerEnum.BuildView;
let func = enums.FuncEnum.PickUdfsFromAsDeps;
let testId = 'v__1';

test(testId, async () => {
  let views: interfaces.View[];
  let errors: BmError[];

  try {
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
      type: api.ConnectionTypeEnum.BigQuery
    };

    await structService.rebuildStruct({
      traceId: traceId,
      dir: dataDir,
      structId: structId,
      connections: [connection],
      weekStart: api.ProjectWeekStartEnum.Monday
    });

    views = await helper.readLog(fromDir, enums.LogTypeEnum.Views);
    errors = await helper.readLog(fromDir, enums.LogTypeEnum.Errors);
    fse.copySync(fromDir, toDir);
  } catch (e) {
    api.logToConsole(e);
  }

  expect(views.length).toBe(2);
  expect(errors.length).toBe(0);

  expect(views[0].udfs.length).toBe(1);
  expect(views[1].udfs.length).toBe(1);
});
