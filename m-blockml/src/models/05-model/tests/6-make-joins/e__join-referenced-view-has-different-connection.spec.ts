import { api } from '../../../../barrels/api';
import { enums } from '../../../../barrels/enums';
import { interfaces } from '../../../../barrels/interfaces';
import { helper } from '../../../../barrels/helper';
import { prepareTest } from '../../../../functions/prepare-test';
import { BmError } from '../../../../models/bm-error';
import * as fse from 'fs-extra';

let caller = enums.CallerEnum.BuildModel;
let func = enums.FuncEnum.MakeJoins;
let testId = 'e__join-referenced-view-has-different-connection';

test(testId, async () => {
  let errors: BmError[];
  let models: interfaces.Model[];

  try {
    let {
      structService,
      traceId,
      structId,
      dataDir,
      fromDir,
      toDir
    } = await prepareTest(caller, func, testId);

    let c1: api.ProjectConnection = {
      name: 'c1',
      type: api.ConnectionTypeEnum.BigQuery
    };

    let c2: api.ProjectConnection = {
      name: 'c2',
      type: api.ConnectionTypeEnum.BigQuery
    };

    await structService.rebuildStruct({
      traceId: traceId,
      dir: dataDir,
      structId: structId,
      connections: [c1, c2],
      weekStart: api.ProjectWeekStartEnum.Monday
    });

    errors = await helper.readLog(fromDir, enums.LogTypeEnum.Errors);
    models = await helper.readLog(fromDir, enums.LogTypeEnum.Models);
    fse.copySync(fromDir, toDir);
  } catch (e) {
    api.logToConsole(e);
  }

  expect(errors.length).toBe(2);
  expect(models.length).toBe(0);

  expect(errors[0].title).toBe(
    enums.ErTitleEnum.JOIN_REFERENCED_VIEW_HAS_DIFFERENT_CONNECTION
  );
  expect(errors[0].lines[0].line).toBe(4);

  expect(errors[1].title).toBe(
    enums.ErTitleEnum.JOIN_REFERENCED_VIEW_HAS_DIFFERENT_CONNECTION
  );
  expect(errors[1].lines[0].line).toBe(7);
});
