import { AmError } from '../../../src/barrels/am-error';
import { ApStruct } from '../../../src/barrels/ap-struct';
import { api } from '../../../src/barrels/api';
import { interfaces } from '../../../src/barrels/interfaces';


//

// yarn jest test/unit/08_model_sql_always_where_calc/e247_sql_always_where_calc_refs_filter.test.ts
jest.setTimeout(30000); test('testName', () => {
  expect.assertions(3);

  return ApStruct.rebuildStruct({
    dir: 'test/unit/08_model_sql_always_where_calc/e247',
    weekStart: api.ProjectWeekStartEnum.Monday,
    bqProject: 'flow-1202',
    projectId: 'unkProjectId',
    structId: 'unkStructId'
  }).then((struct: interfaces.Struct) => {

    const desiredError0Lines: interfaces.ErrorLine[] = [
      { line: 2, name: 'e247m.model', path: 'e247m.model' },
    ];

    expect(struct.errors[0].lines).toEqual(expect.arrayContaining(desiredError0Lines));
    expect(struct.errors[0].title).toEqual(`sql_always_where_calc refs filter`);
    expect(struct.errors[0].message).toEqual(
      `sql_always_where_calc can not reference filters. ` +
      `Found referencing filter "f1" of view "e247_one" as "a"`);
  });
});