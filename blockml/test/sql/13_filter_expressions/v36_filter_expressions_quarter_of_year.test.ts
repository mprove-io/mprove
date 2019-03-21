/* tslint:disable:max-line-length */
import { AmError } from '../../../src/barrels/am-error';
import { ApStruct } from '../../../src/barrels/ap-struct';
import { api } from '../../../src/barrels/api';
import { interfaces } from '../../../src/barrels/interfaces';

//

// yarn jest test/sql/13_filter_expressions/v36_filter_expressions_quarter_of_year.test.ts
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
    `        CONCAT(CAST('Q' AS STRING), CAST(EXTRACT(QUARTER FROM 111) AS STRING)) as created___quarter_of_year`,
    '      FROM `1`',
    '      ) as a',
    '    ',
    '    WHERE',
    `      ((UPPER(a.created___quarter_of_year) = UPPER('q1')`,
    `      OR UPPER(a.created___quarter_of_year) = UPPER('q2')`,
    `      OR UPPER(a.created___quarter_of_year) = UPPER('q3')`,
    `      OR UPPER(a.created___quarter_of_year) = UPPER('q4')`,
    `      OR 'any' = 'any')`,
    `      AND NOT UPPER(a.created___quarter_of_year) = UPPER('q1')`,
    `      AND NOT UPPER(a.created___quarter_of_year) = UPPER('q2')`,
    `      AND NOT UPPER(a.created___quarter_of_year) = UPPER('q3')`,
    `      AND NOT UPPER(a.created___quarter_of_year) = UPPER('q4'))`,
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
    dir: 'test/sql/13_filter_expressions/v36',
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
