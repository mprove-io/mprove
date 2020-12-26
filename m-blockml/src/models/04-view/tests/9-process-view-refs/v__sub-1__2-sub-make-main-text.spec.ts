/* eslint-disable @typescript-eslint/quotes */
import { api } from '../../../../barrels/api';
import { enums } from '../../../../barrels/enums';
import { interfaces } from '../../../../barrels/interfaces';
import { helper } from '../../../../barrels/helper';
import { prepareTest } from '../../../../functions/prepare-test';
import { BmError } from '../../../../models/bm-error';
import * as fse from 'fs-extra';

let caller = enums.CallerEnum.BuildView;
let func = enums.FuncEnum.ProcessViewRefs;
let dataDirPart = 'v__sub-1';
let testId = 'v__sub-1__2-sub-make-main-text';

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

    let dataDirArray = dataDir.split('/');
    dataDirArray[dataDirArray.length - 1] = dataDirPart;
    let newDataDir = dataDirArray.join('/');

    await structService.rebuildStruct({
      traceId: traceId,
      dir: newDataDir,
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
  expect(views.length).toBe(2);

  expect(
    views[1].parts['v2__v1__a'].varsSubSteps.find(
      x => x.func === enums.FuncEnum.SubMakeMainText
    )
  ).toEqual({
    func: enums.FuncEnum.SubMakeMainText,
    varsInput: {
      select: ['calc1'],
      depMeasures: {
        mea1: 1
      },
      depDimensions: {
        dim6: 1
      }
    },
    varsOutput: {
      mainText: [
        "  COALESCE(mprove_array_sum(ARRAY_AGG(DISTINCT CONCAT(CONCAT(CAST(dim4 + mk1 AS STRING), '||'), CAST(dim2 + ms1 AS STRING)))), 0) as mea1,",
        '  dim6 as dim6,'
      ],
      groupMainBy: ['2'],
      selected: {
        calc1: 1,
        mea1: 1,
        dim6: 1
      },
      processedFields: {
        calc1: 'mea1 + dim6 + 1',
        mea1:
          "COALESCE(mprove_array_sum(ARRAY_AGG(DISTINCT CONCAT(CONCAT(CAST(dim4 + mk1 AS STRING), '||'), CAST(dim2 + ms1 AS STRING)))), 0)",
        dim6: 'dim6'
      },
      extraUdfs: {
        mprove_array_sum: 1
      }
    }
  });
});
