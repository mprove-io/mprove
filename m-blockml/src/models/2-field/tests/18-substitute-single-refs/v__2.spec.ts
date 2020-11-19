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
  let entitiesViews: interfaces.View[];

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

    entitiesViews = await helper.readLog(fromDir, enums.LogTypeEnum.Entities);
    fse.copySync(fromDir, toDir);
  } catch (e) {
    api.logToConsole(e);
  }

  expect(entitiesViews.length).toBe(1);

  expect(entitiesViews[0].fields.length).toBe(3);

  expect(entitiesViews[0].fields[0].sqlReal).toBe('d1');

  expect(entitiesViews[0].fields[1].sqlReal).toBe(
    // eslint-disable-next-line @typescript-eslint/quotes
    "TO_CHAR(DATE_TRUNC('month', mprovetimestampstart(d1) + t1mprovetimestampend), 'YYYY-MM')"
  );
  expect(entitiesViews[0].fields[2].sqlReal).toBe(
    // eslint-disable-next-line @typescript-eslint/quotes
    "(TO_CHAR(DATE_TRUNC('month', mprovetimestampstart(d1) + t1mprovetimestampend), 'YYYY-MM')) + d2"
  );

  expect(entitiesViews[0].fieldsDeps).toStrictEqual({
    dim1: {},
    time1___month: {
      dim1: 8
    },
    dim2: {
      time1___month: 13
    }
  });

  expect(entitiesViews[0].fieldsDepsAfterSingles).toStrictEqual({
    dim1: {},
    time1___month: {},
    dim2: {}
  });
});