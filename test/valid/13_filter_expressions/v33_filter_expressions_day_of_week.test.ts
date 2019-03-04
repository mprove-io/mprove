/* tslint:disable:max-line-length */
import { AmError } from '../../../src/barrels/am-error';
import { ApStruct } from '../../../src/barrels/ap-struct';
import { api } from '../../../src/barrels/api';
import { interfaces } from '../../../src/barrels/interfaces';


//

// yarn jest test/valid/13_filter_expressions/v33_filter_expressions_day_of_week.test.ts
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
    '        FORMAT_TIMESTAMP(\'%A\', 222) as created___day_of_week',
    '      FROM `1`',
    '      ) as a',
    '    ',
    '    WHERE',
    '      ((UPPER(a.created___day_of_week) = UPPER(\'Monday\')',
    '      OR UPPER(a.created___day_of_week) = UPPER(\'Tuesday\')',
    '      OR UPPER(a.created___day_of_week) = UPPER(\'Wednesday\')',
    '      OR UPPER(a.created___day_of_week) = UPPER(\'Thursday\')',
    '      OR UPPER(a.created___day_of_week) = UPPER(\'Friday\')',
    '      OR UPPER(a.created___day_of_week) = UPPER(\'Saturday\')',
    '      OR UPPER(a.created___day_of_week) = UPPER(\'Sunday\')',
    '      OR \'any\' = \'any\')',
    '      AND NOT UPPER(a.created___day_of_week) = UPPER(\'Monday\')',
    '      AND NOT UPPER(a.created___day_of_week) = UPPER(\'Tuesday\')',
    '      AND NOT UPPER(a.created___day_of_week) = UPPER(\'Wednesday\')',
    '      AND NOT UPPER(a.created___day_of_week) = UPPER(\'Thursday\')',
    '      AND NOT UPPER(a.created___day_of_week) = UPPER(\'Friday\')',
    '      AND NOT UPPER(a.created___day_of_week) = UPPER(\'Saturday\')',
    '      AND NOT UPPER(a.created___day_of_week) = UPPER(\'Sunday\'))',
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
    dir: 'test/valid/13_filter_expressions/v33',
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