/* tslint:disable:max-line-length */
import { AmError } from '../../../src/barrels/am-error';
import { ApStruct } from '../../../src/barrels/ap-struct';
import { api } from '../../../src/barrels/api';
import { interfaces } from '../../../src/barrels/interfaces';

//

// yarn jest test/valid/14_apply_filter/v44_apply_filter_from_field_ts.test.ts
jest.setTimeout(30000);
test('testName', () => {
  let query = [
    '#standardSQL',
    'WITH',
    '  v44_one__a AS (',
    `    SELECT *
    FROM abc
    WHERE ((target5 >= CAST(DATE_ADD(CAST(CURRENT_TIMESTAMP() AS DATE), INTERVAL -5 YEAR) AS TIMESTAMP) AND target5 < CURRENT_TIMESTAMP()))`,
    '  ),',
    '',
    '  v44_one__b AS (',
    `    SELECT *
    FROM abc
    WHERE ((target5 >= CAST(DATE_ADD(CAST(CURRENT_TIMESTAMP() AS DATE), INTERVAL -5 YEAR) AS TIMESTAMP) AND target5 < CURRENT_TIMESTAMP()))`,
    '  ),',
    '',
    '  model_main AS (',
    '    SELECT',
    '      b.dim1 as b_dim1',
    '    FROM (',
    '      SELECT',
    '        dim1 as dim1',
    '      FROM v44_one__a',
    '      ) as a',
    '    ',
    '    LEFT OUTER JOIN (',
    '      SELECT',
    '        dim1 as dim1',
    '      FROM v44_one__b',
    '      ) as b',
    '    ON a.dim1 = b.dim1',
    '    ',
    '    WHERE',
    '      (((target4 >= CAST(DATE_ADD(CAST(CURRENT_TIMESTAMP() AS DATE), INTERVAL -3 YEAR) AS TIMESTAMP) AND target4 < CURRENT_TIMESTAMP())))',
    '     AND',
    '      (((target1 >= CAST(DATE_ADD(CAST(CURRENT_TIMESTAMP() AS DATE), INTERVAL -1 YEAR) AS TIMESTAMP) AND target1 < CURRENT_TIMESTAMP())))',
    '',
    '    GROUP BY 1',
    '  )',
    '',
    'SELECT',
    '  b_dim1',
    'FROM model_main',
    '',
    'WHERE',
    '  (((target3 >= CAST(DATE_ADD(CAST(CURRENT_TIMESTAMP() AS DATE), INTERVAL -3 YEAR) AS TIMESTAMP) AND target3 < CURRENT_TIMESTAMP())))',
    '',
    'LIMIT 500'
  ];

  expect.assertions(query.length);

  return ApStruct.rebuildStruct({
    dir: 'test/valid/14_apply_filter/v44',
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
