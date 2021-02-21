import test from 'ava';
import * as fse from 'fs-extra';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { prepareTest } from '~blockml/functions/prepare-test';
import { BmError } from '~blockml/models/bm-error';

let caller = enums.CallerEnum.BuildViewField;
let func = enums.FuncEnum.SubstituteSingleRefs;
let testId = 'v__1';

test('1', async t => {
  let errors: BmError[];
  let entViews: interfaces.View[];

  try {
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
      connections: [connection]
    });

    errors = await helper.readLog(fromDir, enums.LogTypeEnum.Errors);
    entViews = await helper.readLog(fromDir, enums.LogTypeEnum.Entities);
    if (common.isDefined(toDir)) {
      fse.copySync(fromDir, toDir);
    }
  } catch (e) {
    common.logToConsole(e);
  }

  t.is(errors.length, 0);
  t.is(entViews.length, 1);

  t.is(entViews[0].fields.length, 7);
  t.is(entViews[0].fields[0].sqlReal, 'd1');
  t.is(entViews[0].fields[1].sqlReal, '(d1) + d2');
  t.is(entViews[0].fields[2].sqlReal, '((d1) + d2) + d3');
  t.is(entViews[0].fields[3].sqlReal, 'd4');

  t.is(entViews[0].fields[4].sqlReal, '${dim3} + m1');

  t.is(entViews[0].fields[5].sqlReal, '${mea1} + ${dim3} + c1');
  t.is(
    entViews[0].fields[6].sqlReal,
    '(${mea1} + ${dim3} + c1) + ${dim4} + c2'
  );

  t.deepEqual(entViews[0].fieldsDeps, {
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

  t.deepEqual(entViews[0].fieldsDepsAfterSingles, {
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
