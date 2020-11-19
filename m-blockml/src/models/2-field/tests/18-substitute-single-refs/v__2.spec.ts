import { api } from '../../../../barrels/api';
import { enums } from '../../../../barrels/enums';
import { interfaces } from '../../../../barrels/interfaces';
import { helper } from '../../../../barrels/helper';
import { prepareTest } from '../../../../functions/prepare-test';
import * as fse from 'fs-extra';

let caller = enums.CallerEnum.FieldBuildViews;
let func = enums.FuncEnum.SubstituteSingleRefs;
let testId = 'v__2';

test(testId, async () => {
  let views: interfaces.View[];

  try {
    let {
      structService,
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
      dir: dataDir,
      structId: structId,
      projectId: 'p1',
      connections: [connection],
      weekStart: api.ProjectWeekStartEnum.Monday
    });

    views = await helper.readLog(fromDir, enums.LogTypeEnum.Entities);
    fse.copySync(fromDir, toDir);
  } catch (e) {
    api.logToConsole(e);
  }

  expect(views.length).toBe(1);

  expect(views[0].fields.length).toBe(3);

  expect(views[0].fields[0].sqlReal).toBe('d1');

  expect(views[0].fields[1].sqlReal).toBe(
    "TO_CHAR(DATE_TRUNC('month', mprovetimestampstart(d1) + t1mprovetimestampend), 'YYYY-MM')"
  );
  expect(views[0].fields[2].sqlReal).toBe(
    "(TO_CHAR(DATE_TRUNC('month', mprovetimestampstart(d1) + t1mprovetimestampend), 'YYYY-MM')) + d2"
  );

  expect(views[0].fieldsDeps).toStrictEqual({
    dim1: {},
    time1___month: {
      dim1: 8
    },
    dim2: {
      time1___month: 13
    }
  });

  expect(views[0].fieldsDepsAfterSingles).toStrictEqual({
    dim1: {},
    time1___month: {},
    dim2: {}
  });
});
