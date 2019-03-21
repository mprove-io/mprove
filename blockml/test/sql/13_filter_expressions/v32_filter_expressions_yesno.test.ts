/* tslint:disable:max-line-length */
import { AmError } from '../../../src/barrels/am-error';
import { ApStruct } from '../../../src/barrels/ap-struct';
import { api } from '../../../src/barrels/api';
import { interfaces } from '../../../src/barrels/interfaces';

//

// yarn jest test/sql/13_filter_expressions/v32_filter_expressions_yesno.test.ts
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
    `        CASE
      WHEN (111) IS TRUE THEN \'Yes\'
      ELSE \'No\'
    END as dim1,`,
    `        CASE
      WHEN (222) IS NOT NULL THEN \'Yes\'
      ELSE \'No\'
    END as created___yesno_has_value`,
    '      FROM `1`',
    '      ) as a',
    '    ',
    '    WHERE',
    `      (a.dim1 = 'Yes'`,
    `      OR a.dim1 = 'No'`,
    `      OR 'any' = 'any')`,
    '     AND',
    `      (a.created___yesno_has_value = 'Yes'`,
    `      OR a.created___yesno_has_value = 'No'`,
    `      OR 'any' = 'any')`,
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
    dir: 'test/sql/13_filter_expressions/v32',
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
