/* tslint:disable:max-line-length */
import { AmError } from '../../../src/barrels/am-error';
import { ApStruct } from '../../../src/barrels/ap-struct';
import { api } from '../../../src/barrels/api';
import { interfaces } from '../../../src/barrels/interfaces';

//

// yarn jest test/sql/13_filter_expressions/v34_filter_expressions_day_of_week_index.test.ts
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
      WHEN EXTRACT(DAYOFWEEK FROM 111) = 1 THEN 7
      ELSE EXTRACT(DAYOFWEEK FROM 111) - 1
    END as created___day_of_week_index,`,
    `        CASE
      WHEN EXTRACT(DAYOFWEEK FROM 222) = 1 THEN 7
      ELSE EXTRACT(DAYOFWEEK FROM 222) - 1
    END as delivered___day_of_week_index,`,
    `        CASE
      WHEN EXTRACT(DAYOFWEEK FROM 333) = 1 THEN 7
      ELSE EXTRACT(DAYOFWEEK FROM 333) - 1
    END as ordered___day_of_week_index`,
    '      FROM `1`',
    '      ) as a',
    '    ',
    '    WHERE',
    `      (('any' = 'any'`,
    '      OR a.created___day_of_week_index IN (1,2,3))',
    '      AND NOT (a.created___day_of_week_index IN (4,5,6,7)))',
    '     AND',
    `      (('any' = 'any'`,
    '      OR a.delivered___day_of_week_index = 1)',
    '      AND NOT (a.delivered___day_of_week_index = 4))',
    '     AND',
    `      (('any' = 'any'`,
    '      OR a.ordered___day_of_week_index IN (2,3))',
    '      AND NOT (a.ordered___day_of_week_index IN (5,6,7)))',
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
    dir: 'test/sql/13_filter_expressions/v34',
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
