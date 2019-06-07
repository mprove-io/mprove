/* tslint:disable:max-line-length */
import { AmError } from '../../../src/barrels/am-error';
import { ApStruct } from '../../../src/barrels/ap-struct';
import { api } from '../../../src/barrels/api';
import { interfaces } from '../../../src/barrels/interfaces';

//

// yarn jest test/sql/14_apply_filter/v41_apply_filter_sql_where.test.ts
jest.setTimeout(30000);
test('testName', () => {
  let query = [
    '#standardSQL',
    'WITH',
    '  model_main AS (',
    '    SELECT',
    '      b.dim1 as b_dim1',
    '    FROM (',
    '      SELECT',
    '        dim1 as dim1',
    '      FROM `1`',
    '      ) as a',
    '    ',
    '    LEFT OUTER JOIN (',
    '      SELECT',
    '        dim1 as dim1',
    '      FROM `1`',
    '      ) as b',
    '    ON a.dim1 = b.dim1',
    '    ',
    '    WHERE',
    '      ((target > 100))',
    '',
    '    GROUP BY 1',
    '  )',
    '',
    'SELECT',
    '  b_dim1',
    'FROM model_main',
    '',
    'LIMIT 500'
  ];

  expect.assertions(query.length);

  return ApStruct.rebuildStruct({
    dir: 'test/sql/14_apply_filter/v41',
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
