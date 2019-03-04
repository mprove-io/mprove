/* tslint:disable:max-line-length */
import { AmError } from '../../../src/barrels/am-error';
import { ApStruct } from '../../../src/barrels/ap-struct';
import { api } from '../../../src/barrels/api';
import { interfaces } from '../../../src/barrels/interfaces';


//

// yarn jest test/valid/13_filter_expressions/v30_filter_expressions_string.test.ts
jest.setTimeout(30000); test('testName', () => {

  let query = [
    '#standardSQL',
    'WITH',
    '  model_main AS (',
    '    SELECT',
    '      a.dim6 as a_dim6',
    '    FROM (',
    '      SELECT',
    '        600 as dim6,',
    '        111 as dim1',
    '      FROM `1`',
    '      ) as a',
    '    ',
    '    WHERE',
    '      ((a.dim1 = \'foo\'',
    '      OR a.dim1 LIKE \'%foo%\'',
    '      OR a.dim1 LIKE \'foo%\'',
    '      OR a.dim1 LIKE \'%foo\'',
    '      OR (a.dim1 IS NULL)',
    '      OR (a.dim1 IS NULL OR LENGTH(CAST(a.dim1 AS STRING)) = 0)',
    '      OR \'any\' = \'any\')',
    '      AND NOT a.dim1 = \'foo\'',
    '      AND NOT a.dim1 LIKE \'%foo%\'',
    '      AND NOT a.dim1 LIKE \'foo%\'',
    '      AND NOT a.dim1 LIKE \'%foo\'',
    '      AND NOT (a.dim1 IS NULL OR LENGTH(CAST(a.dim1 AS STRING)) = 0)',
    '      AND NOT (a.dim1 IS NULL))',
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
    dir: 'test/valid/13_filter_expressions/v30',
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