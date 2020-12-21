import { api } from '../../../../barrels/api';
import { enums } from '../../../../barrels/enums';
import { interfaces } from '../../../../barrels/interfaces';
import { helper } from '../../../../barrels/helper';
import { prepareTest } from '../../../../functions/prepare-test';
import { BmError } from '../../../../models/bm-error';
import * as fse from 'fs-extra';

let caller = enums.CallerEnum.BuildView;
let func = enums.FuncEnum.ProcessViewRefs;
let testId = 'v__1';

test(testId, async () => {
  let errors: BmError[];
  let views: interfaces.View[];

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

    errors = await helper.readLog(fromDir, enums.LogTypeEnum.Errors);
    views = await helper.readLog(fromDir, enums.LogTypeEnum.Views);
    fse.copySync(fromDir, toDir);
  } catch (e) {
    api.logToConsole(e);
  }

  expect(errors.length).toBe(0);
  expect(views.length).toBe(5);

  let v4 = views[3];
  expect(Object.keys(v4.parts).sort()).toEqual([
    'v2__v1__a',
    'v3__v1__b',
    'v4__v2__c',
    'v4__v3__d'
  ]);
  expect(Object.keys(v4.parts['v4__v2__c'].deps).sort()).toEqual(['v2__v1__a']);
  expect(Object.keys(v4.parts['v4__v3__d'].deps).sort()).toEqual(['v3__v1__b']);

  let v5 = views[4];
  expect(Object.keys(v5.parts).sort()).toEqual([
    'v2__v1__a',
    'v3__v1__b',
    'v4__v2__c',
    'v4__v3__d',
    'v5__v4__e',
    'v5__v4__f'
  ]);
  expect(Object.keys(v5.parts['v5__v4__e'].deps).sort()).toEqual([
    'v4__v2__c',
    'v4__v3__d'
  ]);
  expect(Object.keys(v5.parts['v5__v4__f'].deps).sort()).toEqual([
    'v4__v2__c',
    'v4__v3__d'
  ]);
});
