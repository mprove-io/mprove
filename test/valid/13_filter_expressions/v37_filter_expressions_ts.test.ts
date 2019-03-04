/* tslint:disable:max-line-length */
import { AmError } from '../../../src/barrels/am-error';
import { ApStruct } from '../../../src/barrels/ap-struct';
import { api } from '../../../src/barrels/api';
import { interfaces } from '../../../src/barrels/interfaces';


//

// yarn jest test/valid/13_filter_expressions/v37_filter_expressions_ts.test.ts
jest.setTimeout(30000); test('testName', () => {

  let query = [
    '#standardSQL',
    'WITH',
    '  model_main AS (',
    '    SELECT',
    '      a.dim6 as a_dim6',
    '    FROM (',
    '      SELECT',
    '        111 as created___timestamp,',
    '        600 as dim6,',
    '        FORMAT_TIMESTAMP(\'%F %T\', 111) as created___time',
    '      FROM `1`',
    '      ) as a',
    '    ',
    '    WHERE',
    '      (((a.created___timestamp >= TIMESTAMP(\'2016-07-16 10:52:00\') AND a.created___timestamp < TIMESTAMP_ADD(TIMESTAMP(\'2016-07-16 10:52:00\'), INTERVAL 1 MINUTE))',
    '      OR (a.created___timestamp >= TIMESTAMP(\'2016-07-16 10:00:00\') AND a.created___timestamp < TIMESTAMP_ADD(TIMESTAMP(\'2016-07-16 10:00:00\'), INTERVAL 1 HOUR))',
    '      OR (a.created___timestamp >= TIMESTAMP(\'2016-07-16\') AND a.created___timestamp < CAST(DATE_ADD(CAST(TIMESTAMP(\'2016-07-16\') AS DATE), INTERVAL 1 DAY) AS TIMESTAMP))',
    '      OR (a.created___timestamp >= TIMESTAMP(\'2016-07-01\') AND a.created___timestamp < CAST(DATE_ADD(CAST(TIMESTAMP(\'2016-07-01\') AS DATE), INTERVAL 1 MONTH) AS TIMESTAMP))',
    '      OR (a.created___timestamp >= TIMESTAMP(\'2016-01-01\') AND a.created___timestamp < CAST(DATE_ADD(CAST(TIMESTAMP(\'2016-01-01\') AS DATE), INTERVAL 1 YEAR) AS TIMESTAMP))',
    '      OR (a.created___timestamp >= TIMESTAMP(\'2016-07-16 10:52:00\') AND a.created___timestamp < TIMESTAMP(\'2017-08-22 17:32:00\'))',
    '      OR (a.created___timestamp >= TIMESTAMP(\'2016-07-16 10:00:00\') AND a.created___timestamp < TIMESTAMP(\'2017-08-22 17:00:00\'))',
    '      OR (a.created___timestamp >= TIMESTAMP(\'2016-07-16\') AND a.created___timestamp < TIMESTAMP(\'2017-08-22\'))',
    '      OR (a.created___timestamp >= TIMESTAMP(\'2016-07-01\') AND a.created___timestamp < TIMESTAMP(\'2017-08-01\'))',
    '      OR (a.created___timestamp >= TIMESTAMP(\'2016-01-01\') AND a.created___timestamp < TIMESTAMP(\'2017-01-01\'))',
    '      OR (a.created___timestamp < TIMESTAMP(\'2016-07-16 10:52:00\'))',
    '      OR (a.created___timestamp < TIMESTAMP(\'2016-07-16 10:00:00\'))',
    '      OR (a.created___timestamp < TIMESTAMP(\'2016-07-16\'))',
    '      OR (a.created___timestamp < TIMESTAMP(\'2016-07-01\'))',
    '      OR (a.created___timestamp < TIMESTAMP(\'2016-01-01\'))',
    '      OR (a.created___timestamp < TIMESTAMP(\'2016-07-16 10:52:00\') AND a.created___timestamp >= CAST(DATE_ADD(CAST(TIMESTAMP(\'2016-07-16 10:52:00\') AS DATE), INTERVAL -2 YEAR) AS TIMESTAMP))',
    '      OR (a.created___timestamp < TIMESTAMP(\'2016-07-16 10:00:00\') AND a.created___timestamp >= CAST(DATE_ADD(CAST(TIMESTAMP(\'2016-07-16 10:00:00\') AS DATE), INTERVAL -2 QUARTER) AS TIMESTAMP))',
    '      OR (a.created___timestamp < TIMESTAMP(\'2016-07-16\') AND a.created___timestamp >= CAST(DATE_ADD(CAST(TIMESTAMP(\'2016-07-16\') AS DATE), INTERVAL -2 MONTH) AS TIMESTAMP))',
    '      OR (a.created___timestamp < TIMESTAMP(\'2016-07-01\') AND a.created___timestamp >= CAST(DATE_ADD(CAST(TIMESTAMP(\'2016-07-01\') AS DATE), INTERVAL -2*7 DAY) AS TIMESTAMP))',
    '      OR (a.created___timestamp < TIMESTAMP(\'2016-01-01\') AND a.created___timestamp >= CAST(DATE_ADD(CAST(TIMESTAMP(\'2016-01-01\') AS DATE), INTERVAL -2 DAY) AS TIMESTAMP))',
    '      OR (a.created___timestamp < CAST(DATE_ADD(CAST(CURRENT_TIMESTAMP() AS DATE), INTERVAL -5 YEAR) AS TIMESTAMP))',
    '      OR (a.created___timestamp < CAST(DATE_ADD(CAST(TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), QUARTER) AS DATE), INTERVAL -5 QUARTER) AS TIMESTAMP))',
    '      OR (a.created___timestamp < CAST(DATE_ADD(CAST(CURRENT_TIMESTAMP() AS DATE), INTERVAL 5 MONTH) AS TIMESTAMP))',
    '      OR (a.created___timestamp < TIMESTAMP_ADD(TIMESTAMP_ADD(TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), WEEK), INTERVAL 1 DAY), INTERVAL 5*7 + 1*7 DAY))',
    '      OR (a.created___timestamp < TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL -5 DAY) AND a.created___timestamp >= TIMESTAMP_ADD(TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL -5 DAY), INTERVAL -2 HOUR))',
    '      OR (a.created___timestamp < TIMESTAMP_ADD(TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), HOUR), INTERVAL -5 HOUR) AND a.created___timestamp >= TIMESTAMP_ADD(TIMESTAMP_ADD(TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), HOUR), INTERVAL -5 HOUR), INTERVAL -2 MINUTE))',
    '      OR (a.created___timestamp < TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL 5 MINUTE) AND a.created___timestamp >= TIMESTAMP_ADD(TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL 5 MINUTE), INTERVAL -2 MINUTE))',
    '      OR (a.created___timestamp < TIMESTAMP_ADD(TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), MINUTE), INTERVAL 5 + 1 MINUTE) AND a.created___timestamp >= TIMESTAMP_ADD(TIMESTAMP_ADD(TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), MINUTE), INTERVAL 5 + 1 MINUTE), INTERVAL -2 MINUTE))',
    '      OR (a.created___timestamp >= TIMESTAMP(\'2016-07-16 10:52:00\'))',
    '      OR (a.created___timestamp >= TIMESTAMP(\'2016-07-16 10:00:00\'))',
    '      OR (a.created___timestamp >= TIMESTAMP(\'2016-07-16\'))',
    '      OR (a.created___timestamp >= TIMESTAMP(\'2016-07-01\'))',
    '      OR (a.created___timestamp >= TIMESTAMP(\'2016-01-01\'))',
    '      OR (a.created___timestamp >= TIMESTAMP(\'2016-07-16 10:52:00\') AND a.created___timestamp < CAST(DATE_ADD(CAST(TIMESTAMP(\'2016-07-16 10:52:00\') AS DATE), INTERVAL 2 YEAR) AS TIMESTAMP))',
    '      OR (a.created___timestamp >= TIMESTAMP(\'2016-07-16 10:00:00\') AND a.created___timestamp < CAST(DATE_ADD(CAST(TIMESTAMP(\'2016-07-16 10:00:00\') AS DATE), INTERVAL 2 QUARTER) AS TIMESTAMP))',
    '      OR (a.created___timestamp >= TIMESTAMP(\'2016-07-16\') AND a.created___timestamp < CAST(DATE_ADD(CAST(TIMESTAMP(\'2016-07-16\') AS DATE), INTERVAL 2 MONTH) AS TIMESTAMP))',
    '      OR (a.created___timestamp >= TIMESTAMP(\'2016-07-01\') AND a.created___timestamp < CAST(DATE_ADD(CAST(TIMESTAMP(\'2016-07-01\') AS DATE), INTERVAL 2*7 DAY) AS TIMESTAMP))',
    '      OR (a.created___timestamp >= TIMESTAMP(\'2016-01-01\') AND a.created___timestamp < CAST(DATE_ADD(CAST(TIMESTAMP(\'2016-01-01\') AS DATE), INTERVAL 2 DAY) AS TIMESTAMP))',
    '      OR (a.created___timestamp >= CAST(DATE_ADD(CAST(CURRENT_TIMESTAMP() AS DATE), INTERVAL -5 YEAR) AS TIMESTAMP))',
    '      OR (a.created___timestamp >= CAST(DATE_ADD(CAST(TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), QUARTER) AS DATE), INTERVAL -5 QUARTER) AS TIMESTAMP))',
    '      OR (a.created___timestamp >= CAST(DATE_ADD(CAST(CURRENT_TIMESTAMP() AS DATE), INTERVAL 5 MONTH) AS TIMESTAMP))',
    '      OR (a.created___timestamp >= TIMESTAMP_ADD(TIMESTAMP_ADD(TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), WEEK), INTERVAL 1 DAY), INTERVAL 5*7 + 1*7 DAY))',
    '      OR (a.created___timestamp >= TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL -5 DAY) AND a.created___timestamp < TIMESTAMP_ADD(TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL -5 DAY), INTERVAL 2 HOUR))',
    '      OR (a.created___timestamp >= TIMESTAMP_ADD(TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), HOUR), INTERVAL -5 HOUR) AND a.created___timestamp < TIMESTAMP_ADD(TIMESTAMP_ADD(TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), HOUR), INTERVAL -5 HOUR), INTERVAL 2 MINUTE))',
    '      OR (a.created___timestamp >= TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL 5 MINUTE) AND a.created___timestamp < TIMESTAMP_ADD(TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL 5 MINUTE), INTERVAL 2 MINUTE))',
    '      OR (a.created___timestamp >= TIMESTAMP_ADD(TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), MINUTE), INTERVAL 5 + 1 MINUTE) AND a.created___timestamp < TIMESTAMP_ADD(TIMESTAMP_ADD(TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), MINUTE), INTERVAL 5 + 1 MINUTE), INTERVAL 2 MINUTE))',
    '      OR (a.created___timestamp >= TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL -5 DAY) AND a.created___timestamp < CURRENT_TIMESTAMP())',
    '      OR (a.created___timestamp >= TIMESTAMP_ADD(TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), DAY), INTERVAL -5 DAY) AND a.created___timestamp < TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), DAY))',
    '      OR (a.created___timestamp >= TIMESTAMP_ADD(TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), DAY), INTERVAL -5 DAY) AND a.created___timestamp < TIMESTAMP_ADD(TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), DAY), INTERVAL 1 DAY))',
    '      OR (a.created___timestamp IS NULL)',
    '      OR \'any\' = \'any\')',
    '      AND NOT (a.created___timestamp IS NULL))',
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
    dir: 'test/valid/13_filter_expressions/v37',
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