/* tslint:disable:max-line-length */
import { AmError } from '../../../src/barrels/am-error';
import { ApStruct } from '../../../src/barrels/ap-struct';
import { api } from '../../../src/barrels/api';
import { interfaces } from '../../../src/barrels/interfaces';


//

// yarn jest test/valid/14_apply_filter/v43_apply_filter_untouched_override_by_user_false.test.ts
jest.setTimeout(30000); test('testName', () => {

  let query = [
    '#standardSQL',
    'WITH',
    '  v43_one__a AS (',
    `    SELECT *
    FROM abc
    WHERE (target5 > 5000)
    AND \'empty filter a.f6 applied\' = \'empty filter a.f6 applied\'`,
    '  ),',
    '',
    '  v43_one__b AS (',
    `    SELECT *
    FROM abc
    WHERE (target5 > 500)
    AND \'empty filter b.f6 applied\' = \'empty filter b.f6 applied\'`,
    '  ),',
    '',
    '  model_main AS (',
    '    SELECT',
    '      b.dim1 as b_dim1',
    '    FROM (',
    '      SELECT',
    '        dim1 as dim1',
    '      FROM v43_one__a',
    '      ) as a',
    '    ',
    '    LEFT OUTER JOIN (',
    '      SELECT',
    '        dim1 as dim1',
    '      FROM v43_one__b',
    '      ) as b',
    '    ON a.dim1 = b.dim1',
    '    ',
    '    WHERE',
    '      (\'empty filter mf.f4 applied\' = \'empty filter mf.f4 applied\')',
    '     AND',
    `      ((target1 > 100)
AND (target2 > 200))`,
    '',
    '    GROUP BY 1',
    '  )',
    '',
    'SELECT',
    '  b_dim1',
    'FROM model_main',
    '',
    'WHERE',
    '  ((target3 > 300))',
    '',
    'LIMIT 500'
  ];

  expect.assertions(query.length);

  return ApStruct.rebuildStruct({
    dir: 'test/valid/14_apply_filter/v43',
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