import { AmError } from '../../../src/barrels/am-error';
import { ApStruct } from '../../../src/barrels/ap-struct';
import { api } from '../../../src/barrels/api';
import { interfaces } from '../../../src/barrels/interfaces';

//

// yarn jest test/errors/08_model_sql_always_where_calc/e152_wrong_chars_in_sql_always_where_calc_refs.test.ts
jest.setTimeout(30000);
test('testName', () => {
  expect.assertions(3);

  return ApStruct.rebuildStruct({
    dir: 'test/errors/08_model_sql_always_where_calc/e152',
    weekStart: api.ProjectWeekStartEnum.Monday,
    bqProject: 'flow-1202',
    projectId: 'unkProjectId',
    structId: 'unkStructId'
  }).then((struct: interfaces.Struct) => {
    const desiredError0Lines: interfaces.ErrorLine[] = [
      { line: 2, name: 'e152m.model', path: 'e152m.model' }
    ];

    expect(struct.errors[0].lines).toEqual(
      expect.arrayContaining(desiredError0Lines)
    );
    expect(struct.errors[0].title).toEqual(
      `wrong chars in sql_always_where_calc refs`
    );
    expect(struct.errors[0].message).toEqual(
      `characters "!,  , @, $, %, ^, &, *, (, ), -, +, =" can not be used inside \$\{\} of model`
    );
  });
});
