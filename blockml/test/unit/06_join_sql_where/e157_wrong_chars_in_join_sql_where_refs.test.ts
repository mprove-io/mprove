import { AmError } from '../../../src/barrels/am-error';
import { ApStruct } from '../../../src/barrels/ap-struct';
import { api } from '../../../src/barrels/api';
import { interfaces } from '../../../src/barrels/interfaces';

//

// yarn jest test/unit/06_join_sql_where/e157_wrong_chars_in_join_sql_where_refs.test.ts
jest.setTimeout(30000);
test('testName', () => {
  expect.assertions(3);

  return ApStruct.rebuildStruct({
    dir: 'test/unit/06_join_sql_where/e157',
    weekStart: api.ProjectWeekStartEnum.Monday,
    bqProject: 'flow-1202',
    projectId: 'unkProjectId',
    structId: 'unkStructId'
  }).then((struct: interfaces.Struct) => {
    const desiredError0Lines: interfaces.ErrorLine[] = [
      { line: 9, name: 'e157m.model', path: 'e157m.model' }
    ];

    expect(struct.errors[0].lines).toEqual(
      expect.arrayContaining(desiredError0Lines)
    );
    expect(struct.errors[0].title).toEqual(
      `wrong chars in join sql_where refs`
    );
    expect(struct.errors[0].message).toEqual(
      `characters "!,  , @, $, %, ^, &, *, (, ), -, +, =" can not be used inside \$\{\} of model`
    );
  });
});
