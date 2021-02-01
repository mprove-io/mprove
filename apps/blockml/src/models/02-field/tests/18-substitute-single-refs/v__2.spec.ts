import test from 'ava';
import * as fse from 'fs-extra';
import { api } from '~blockml/barrels/api';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { prepareTest } from '~blockml/functions/prepare-test';
import { BmError } from '~blockml/models/bm-error';

let caller = enums.CallerEnum.BuildViewField;
let func = enums.FuncEnum.SubstituteSingleRefs;
let testId = 'v__2';

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

    errors = await helper.readLog(fromDir, enums.LogTypeEnum.Errors);
    entViews = await helper.readLog(fromDir, enums.LogTypeEnum.Entities);
    if (helper.isDefined(toDir)) {
      fse.copySync(fromDir, toDir);
    }
  } catch (e) {
    api.logToConsole(e);
  }

  t.is(errors.length, 0);
  t.is(entViews.length, 1);

  t.is(entViews[0].fields.length, 3);

  t.is(entViews[0].fields[0].sqlReal, 'd1');

  t.is(
    entViews[0].fields[1].sqlReal,
    "TO_CHAR(DATE_TRUNC('month', mprovetimestampstart(d1) + t1mprovetimestampend), 'YYYY-MM')"
  );
  t.is(
    entViews[0].fields[2].sqlReal,
    "(TO_CHAR(DATE_TRUNC('month', mprovetimestampstart(d1) + t1mprovetimestampend), 'YYYY-MM')) + d2"
  );

  t.deepEqual(entViews[0].fieldsDeps, {
    dim1: {},
    time1___month: {
      dim1: 8
    },
    dim2: {
      time1___month: 13
    }
  });

  t.deepEqual(entViews[0].fieldsDepsAfterSingles, {
    dim1: {},
    time1___month: {},
    dim2: {}
  });
});
