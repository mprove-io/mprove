/* tslint:disable:max-line-length */
import { AmError } from '../../../src/barrels/am-error';
import { ApStruct } from '../../../src/barrels/ap-struct';
import { api } from '../../../src/barrels/api';
import { interfaces } from '../../../src/barrels/interfaces';

//

// yarn jest test/sql/10_wherecalc_refs_mea/v23_wherecalc_refs_view_mea.test.ts
jest.setTimeout(30000);
test('testName', () => {
  let query = [
    '#standardSQL',
    `CREATE TEMPORARY FUNCTION mprove_array_sum(ar ARRAY<STRING>) AS
  ((SELECT SUM(CAST(REGEXP_EXTRACT(val, \'\\\\|\\\\|(\\\\-?\\\\d+(?:.\\\\d+)?)$\') AS FLOAT64)) FROM UNNEST(ar) as val));`,
    'WITH',
    '  model_main AS (',
    '    SELECT',
    '      a.dim6 as a_dim6,',
    `      COALESCE(mprove_array_sum(ARRAY_AGG(DISTINCT CONCAT(CONCAT(CAST(a.dim4 + 200 AS STRING), '||'), CAST(a.dim2 + 100 AS STRING)))), 0) as a_mea2,`,
    '      MIN(a.dim7) as a_mea3',
    '    FROM (',
    '      SELECT',
    '        600 as dim6,',
    '        (111) + 222 as dim2,',
    '        (333) + 444 as dim4,',
    '        555 as dim7',
    '      FROM `1`',
    '      ) as a',
    '    ',
    '    GROUP BY 1',
    '  )',
    '',
    'SELECT',
    '  a_dim6',
    'FROM model_main',
    '',
    'WHERE',
    '  (a_mea2 + a_mea3 > 100)',
    '',
    'LIMIT 500'
  ];

  expect.assertions(query.length);

  return ApStruct.rebuildStruct({
    dir: 'test/sql/10_wherecalc_refs_mea/v23',
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
