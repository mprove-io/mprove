import { api } from '../../../../barrels/api';
import { enums } from '../../../../barrels/enums';
import { interfaces } from '../../../../barrels/interfaces';
import { helper } from '../../../../barrels/helper';
import { prepareTest } from '../../../../functions/prepare-test';
import * as fse from 'fs-extra';

let caller = enums.CallerEnum.FieldBuildViews;
let func = enums.FuncEnum.SubstituteSingleRefs;
let testId = 'v__1';

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
  expect(entitiesViews[0].fields.length).toBe(7);
  expect(entitiesViews[0].fields[0].sqlReal).toBe('d1');
  expect(entitiesViews[0].fields[1].sqlReal).toBe('(d1) + d2');
  expect(entitiesViews[0].fields[2].sqlReal).toBe('((d1) + d2) + d3');
  expect(entitiesViews[0].fields[3].sqlReal).toBe('d4');

  expect(entitiesViews[0].fields[4].sqlReal).toBe('${dim3} + m1');

  expect(entitiesViews[0].fields[5].sqlReal).toBe('${mea1} + ${dim3} + c1');
  expect(entitiesViews[0].fields[6].sqlReal).toBe(
    '(${mea1} + ${dim3} + c1) + ${dim4} + c2'
  );

  expect(entitiesViews[0].fields[5].prepForceDims).toStrictEqual({
    dim3: 21
  });

  expect(entitiesViews[0].fields[6].prepForceDims).toStrictEqual({
    dim3: 24,
    dim4: 24
  });

  expect(entitiesViews[0].fieldsDeps).toStrictEqual({
    dim1: {},
    dim2: {
      dim1: 8
    },
    dim3: {
      dim2: 11
    },
    dim4: {},
    mea1: {
      dim3: 18
    },
    calc1: {
      dim3: 21,
      mea1: 21
    },
    calc2: {
      calc1: 24,
      dim4: 24
    }
  });

  expect(entitiesViews[0].fieldsDepsAfterSingles).toStrictEqual({
    dim1: {},
    dim2: {},
    dim3: {},
    dim4: {},
    mea1: {
      dim3: 18
    },
    calc1: {
      dim3: 21,
      mea1: 21
    },
    calc2: {
      dim3: 24,
      mea1: 24,
      dim4: 24
    }
  });
});
