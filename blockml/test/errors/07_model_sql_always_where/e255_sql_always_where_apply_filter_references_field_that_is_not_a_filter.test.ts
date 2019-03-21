import { AmError } from '../../../src/barrels/am-error';
import { ApStruct } from '../../../src/barrels/ap-struct';
import { api } from '../../../src/barrels/api';
import { interfaces } from '../../../src/barrels/interfaces';

//

// tslint:disable-next-line:max-line-length
// yarn jest test/errors/07_model_sql_always_where/e255_sql_always_where_apply_filter_references_field_that_is_not_a_filter.test.ts

jest.setTimeout(30000);
test('testName', () => {
  expect.assertions(3);

  return ApStruct.rebuildStruct({
    dir: 'test/errors/07_model_sql_always_where/e255',
    weekStart: api.ProjectWeekStartEnum.Monday,
    bqProject: 'flow-1202',
    projectId: 'unkProjectId',
    structId: 'unkStructId'
  }).then((struct: interfaces.Struct) => {
    const desiredError0Lines: interfaces.ErrorLine[] = [
      { line: 2, name: 'e255m.model', path: 'e255m.model' }
    ];

    expect(struct.errors[0].lines).toEqual(
      expect.arrayContaining(desiredError0Lines)
    );
    expect(struct.errors[0].title).toEqual(
      `sql_always_where apply_filter references field that is not a filter`
    );
    expect(struct.errors[0].message).toEqual(
      `apply_filter must reference filter. ` +
        `Found field "dim1" that is dimension`
    );
  });
});
