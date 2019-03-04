import { AmError } from '../../../src/barrels/am-error';
import { ApStruct } from '../../../src/barrels/ap-struct';
import { api } from '../../../src/barrels/api';
import { interfaces } from '../../../src/barrels/interfaces';


//

// yarn jest test/valid/09_wherecalc_refs_dim/v21_wherecalc_refs_view_dim.test.ts
jest.setTimeout(30000); test('testName', () => {

  let query = [
    '#standardSQL',
    'WITH',
    '  model_main AS (',
    '    SELECT',
    '      a.dim6 as a_dim6,',
    '      a.dim5 as a_dim5,',
    '      a.dim4 as a_dim4',
    '    FROM (',
    '      SELECT',
    '        600 as dim6,',
    '        555 as dim5,',
    '        (((111) + 222) + 333) + 444 as dim4',
    '      FROM `1`',
    '      ) as a',
    '    ',
    '    GROUP BY 1, 2, 3',
    '  )',
    '',
    'SELECT',
    '  a_dim6,',
    '  a_dim5,',
    '  a_dim4',
    'FROM model_main',
    '',
    'WHERE',
    '  (a_dim4 + a_dim5 > 100)',
    '',
    'LIMIT 500'
  ];

  expect.assertions(query.length);

  return ApStruct.rebuildStruct({
    dir: 'test/valid/09_wherecalc_refs_dim/v21',
    weekStart: api.ProjectWeekStartEnum.Monday,
    bqProject: 'flow-1202',
    projectId: 'unkProjectId',
    structId: 'unkStructId'
  }).then((struct: interfaces.Struct) => {

    struct.dashboards[0].reports[0].bq_views[0].sql.forEach((element, i, a) => {
      expect(element).toEqual(query[i]);
    });

  });
});