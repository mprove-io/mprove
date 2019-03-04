/* tslint:disable:max-line-length */
import { AmError } from '../../../src/barrels/am-error';
import { ApStruct } from '../../../src/barrels/ap-struct';
import { api } from '../../../src/barrels/api';
import { interfaces } from '../../../src/barrels/interfaces';

//

// yarn jest test/valid/14_apply_filter/v42_apply_filter_derived_table.test.ts
jest.setTimeout(30000);
test('testName', () => {
  let query = [
    '#standardSQL',
    'WITH',
    '  v42_one__a AS (',
    `    SELECT *
    FROM abc
    WHERE (target > 100)`,
    '  ),',
    '',
    '  model_main AS (',
    '    SELECT',
    '      a.dim1 as a_dim1',
    '    FROM (',
    '      SELECT',
    '        dim1 as dim1',
    '      FROM v42_one__a',
    '      ) as a',
    '    ',
    '    GROUP BY 1',
    '  )',
    '',
    'SELECT',
    '  a_dim1',
    'FROM model_main',
    '',
    'LIMIT 500'
  ];

  expect.assertions(query.length);

  return ApStruct.rebuildStruct({
    dir: 'test/valid/14_apply_filter/v42',
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
