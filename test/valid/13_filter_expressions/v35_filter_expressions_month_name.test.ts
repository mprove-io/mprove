/* tslint:disable:max-line-length */
import { AmError } from '../../../src/barrels/am-error';
import { ApStruct } from '../../../src/barrels/ap-struct';
import { api } from '../../../src/barrels/api';
import { interfaces } from '../../../src/barrels/interfaces';


//

// yarn jest test/valid/13_filter_expressions/v35_filter_expressions_month_name.test.ts
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
    `        CASE
      WHEN EXTRACT(MONTH FROM 111) = 1 THEN \'January\'
      WHEN EXTRACT(MONTH FROM 111) = 2 THEN \'February\'
      WHEN EXTRACT(MONTH FROM 111) = 3 THEN \'March\'
      WHEN EXTRACT(MONTH FROM 111) = 4 THEN \'April\'
      WHEN EXTRACT(MONTH FROM 111) = 5 THEN \'May\'
      WHEN EXTRACT(MONTH FROM 111) = 6 THEN \'June\'
      WHEN EXTRACT(MONTH FROM 111) = 7 THEN \'July\'
      WHEN EXTRACT(MONTH FROM 111) = 8 THEN \'August\'
      WHEN EXTRACT(MONTH FROM 111) = 9 THEN \'September\'
      WHEN EXTRACT(MONTH FROM 111) = 10 THEN \'October\'
      WHEN EXTRACT(MONTH FROM 111) = 11 THEN \'November\'
      WHEN EXTRACT(MONTH FROM 111) = 12 THEN \'December\'
    END as created___month_name`,
    '      FROM `1`',
    '      ) as a',
    '    ',
    '    WHERE',
    '      ((UPPER(a.created___month_name) = UPPER(\'January\')',
    '      OR UPPER(a.created___month_name) = UPPER(\'February\')',
    '      OR UPPER(a.created___month_name) = UPPER(\'March\')',
    '      OR UPPER(a.created___month_name) = UPPER(\'April\')',
    '      OR UPPER(a.created___month_name) = UPPER(\'May\')',
    '      OR UPPER(a.created___month_name) = UPPER(\'June\')',
    '      OR UPPER(a.created___month_name) = UPPER(\'July\')',
    '      OR UPPER(a.created___month_name) = UPPER(\'August\')',
    '      OR UPPER(a.created___month_name) = UPPER(\'September\')',
    '      OR UPPER(a.created___month_name) = UPPER(\'October\')',
    '      OR UPPER(a.created___month_name) = UPPER(\'November\')',
    '      OR UPPER(a.created___month_name) = UPPER(\'December\')',
    '      OR \'any\' = \'any\')',
    '      AND NOT UPPER(a.created___month_name) = UPPER(\'January\')',
    '      AND NOT UPPER(a.created___month_name) = UPPER(\'February\')',
    '      AND NOT UPPER(a.created___month_name) = UPPER(\'March\')',
    '      AND NOT UPPER(a.created___month_name) = UPPER(\'April\')',
    '      AND NOT UPPER(a.created___month_name) = UPPER(\'May\')',
    '      AND NOT UPPER(a.created___month_name) = UPPER(\'June\')',
    '      AND NOT UPPER(a.created___month_name) = UPPER(\'July\')',
    '      AND NOT UPPER(a.created___month_name) = UPPER(\'August\')',
    '      AND NOT UPPER(a.created___month_name) = UPPER(\'September\')',
    '      AND NOT UPPER(a.created___month_name) = UPPER(\'October\')',
    '      AND NOT UPPER(a.created___month_name) = UPPER(\'November\')',
    '      AND NOT UPPER(a.created___month_name) = UPPER(\'December\'))',
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
    dir: 'test/valid/13_filter_expressions/v35',
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