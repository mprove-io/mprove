import { AmError } from '../../../src/barrels/am-error';
import { ApStruct } from '../../../src/barrels/ap-struct';
import { api } from '../../../src/barrels/api';
import { interfaces } from '../../../src/barrels/interfaces';

//

// yarn jest test/sql/08_joinwhere_refs_dim/v20_joinwhere_refs_model_dim.test.ts
jest.setTimeout(30000);
test('testName', () => {
  let query = [
    '#standardSQL',
    'WITH',
    '  model_main AS (',
    '    SELECT',
    '      b.dim6 as b_dim6',
    '    FROM (',
    '      SELECT',
    '        1 as no_fields_selected',
    '      FROM `1`',
    '      ) as a',
    '    ',
    '    LEFT OUTER JOIN (',
    '      SELECT',
    '        600 as dim6,',
    '        ((111) + 222) + 333 as dim3',
    '      FROM `1`',
    '      ) as b',
    '    ON 1 = 1',
    '    ',
    '    WHERE',
    '      ((b.dim3 + 444) + (555) > 100)',
    '',
    '    GROUP BY 1',
    '  )',
    '',
    'SELECT',
    '  b_dim6',
    'FROM model_main',
    '',
    'LIMIT 500'
  ];

  expect.assertions(query.length);

  return ApStruct.rebuildStruct({
    dir: 'test/sql/08_joinwhere_refs_dim/v20',
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
