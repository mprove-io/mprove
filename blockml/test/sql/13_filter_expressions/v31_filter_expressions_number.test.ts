/* tslint:disable:max-line-length */
import { AmError } from '../../../src/barrels/am-error';
import { ApStruct } from '../../../src/barrels/ap-struct';
import { api } from '../../../src/barrels/api';
import { interfaces } from '../../../src/barrels/interfaces';

//

// yarn jest test/sql/13_filter_expressions/v31_filter_expressions_number.test.ts
jest.setTimeout(30000);
test('testName', () => {
  let query = [
    '#standardSQL',
    'WITH',
    '  model_main AS (',
    '    SELECT',
    '      a.dim6 as a_dim6',
    '    FROM (',
    '      SELECT',
    '        600 as dim6,',
    '        111 as dim1,',
    '        222 as dim2,',
    '        333 as dim3',
    '      FROM `1`',
    '      ) as a',
    '    ',
    '    WHERE',
    '      ((a.dim1 > 100',
    '      OR a.dim1 >= 100',
    '      OR a.dim1 < 100',
    '      OR a.dim1 <= 100',
    '      OR ((a.dim1 >= 100) AND (a.dim1 <= 200))',
    '      OR ((a.dim1 >= 100) AND (a.dim1 < 200))',
    '      OR ((a.dim1 > 100) AND (a.dim1 <= 200))',
    '      OR ((a.dim1 > 100) AND (a.dim1 < 200))',
    '      OR (a.dim1 IS NULL)',
    `      OR 'any' = 'any'`,
    '      OR a.dim1 IN (105,110,115))',
    '      AND NOT ((a.dim1 >= 100) AND (a.dim1 <= 200))',
    '      AND NOT ((a.dim1 >= 100) AND (a.dim1 < 200))',
    '      AND NOT ((a.dim1 > 100) AND (a.dim1 <= 200))',
    '      AND NOT ((a.dim1 > 100) AND (a.dim1 < 200))',
    '      AND NOT (a.dim1 IS NULL)',
    '      AND NOT (a.dim1 IN (105,110,115)))',
    '     AND',
    `      (('any' = 'any'`,
    '      OR a.dim2 = 100)',
    '      AND NOT (a.dim2 = 100))',
    '     AND',
    `      (('any' = 'any'`,
    '      OR a.dim3 IN (100,105,110,115))',
    '      AND NOT (a.dim3 IN (100,105,110,115)))',
    '',
    '    GROUP BY 1',
    '  )',
    '',
    'SELECT',
    '  a_dim6',
    'FROM model_main',
    '',
    'LIMIT 500'
  ];

  expect.assertions(query.length);

  return ApStruct.rebuildStruct({
    dir: 'test/sql/13_filter_expressions/v31',
    weekStart: api.ProjectWeekStartEnum.Monday,
    connection: api.ProjectConnectionEnum.BigQuery,
    bqProject: 'flow-1202',
    projectId: 'unkProjectId',
    structId: 'unkStructId'
  }).then((struct: interfaces.Struct) => {
    struct.dashboards[0].reports[0].bq_views[0].sql.forEach((element, i, a) => {
      expect(element).toEqual(query[i]);
    });
  });
});
