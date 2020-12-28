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
let testId = 'v__sub-1__6-sub-compose-calc';

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
      x => x.func === enums.FuncEnum.SubComposeCalc
    )
  ).toEqual({
    func: enums.FuncEnum.SubComposeCalc,
    varsInput: {
      mainQuery: [
        'WITH',
        '  v1__derived_table AS (',
        '    SELECT d1, d3, d5, d7',
        '    FROM ',
        '      tab1',
        '  ),',
        '  v1__start AS (',
        '    SELECT',
        '      (d5) + 6 as dim6,',
        '      (d7) + 8 as dim8,',
        "      (FORMAT_TIMESTAMP('%F %H', mprovetimestampstart(d1) + 1mprovetimestampend)) + 2 as dim2,",
        '      (d3) + 4 as dim4',
        '    FROM v1__derived_table',
        '  ),',
        '  v1__main AS (',
        '    SELECT',
        "      COALESCE(mprove_array_sum(ARRAY_AGG(DISTINCT CONCAT(CONCAT(CAST(dim4 + mk1 AS STRING), '||'), CAST(dim2 + ms1 AS STRING)))), 0) as mea1,",
        '      dim6 as dim6,',
        '      dim8 as dim8',
        '    FROM v1__start',
        '    GROUP BY 2, 3',
        '  )'
      ],
      select: ['calc2'],
      processedFields: {
        calc2: '(mea1 + dim6 + 1) + dim8 + 2',
        mea1:
          "COALESCE(mprove_array_sum(ARRAY_AGG(DISTINCT CONCAT(CONCAT(CAST(dim4 + mk1 AS STRING), '||'), CAST(dim2 + ms1 AS STRING)))), 0)",
        dim6: 'dim6',
        dim8: 'dim8'
      }
    },
    varsOutput: {
      sub: [
        '  v2__v1__a AS (',
        '    WITH',
        '      v1__derived_table AS (',
        '        SELECT d1, d3, d5, d7',
        '        FROM ',
        '          tab1',
        '      ),',
        '      v1__start AS (',
        '        SELECT',
        '          (d5) + 6 as dim6,',
        '          (d7) + 8 as dim8,',
        "          (FORMAT_TIMESTAMP('%F %H', mprovetimestampstart(d1) + 1mprovetimestampend)) + 2 as dim2,",
        '          (d3) + 4 as dim4',
        '        FROM v1__derived_table',
        '      ),',
        '      v1__main AS (',
        '        SELECT',
        "          COALESCE(mprove_array_sum(ARRAY_AGG(DISTINCT CONCAT(CONCAT(CAST(dim4 + mk1 AS STRING), '||'), CAST(dim2 + ms1 AS STRING)))), 0) as mea1,",
        '          dim6 as dim6,',
        '          dim8 as dim8',
        '        FROM v1__start',
        '        GROUP BY 2, 3',
        '      )',
        '    SELECT',
        '      (mea1 + dim6 + 1) + dim8 + 2 as calc2',
        '    FROM v1__main',
        '  ),'
      ]
    }
  });
});
