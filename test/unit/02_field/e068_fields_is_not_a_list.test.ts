import { AmError } from '../../../src/barrels/am-error';
import { ApStruct } from '../../../src/barrels/ap-struct';
import { api } from '../../../src/barrels/api';
import { interfaces } from '../../../src/barrels/interfaces';


//

// yarn jest test/unit/02_field/e068_fields_is_not_a_list.test.ts
jest.setTimeout(30000); test('testName', () => {
  expect.assertions(3);

  return ApStruct.rebuildStruct({
    dir: 'test/unit/02_field/e68',
    weekStart: api.ProjectWeekStartEnum.Monday,
    bqProject: 'flow-1202',
    projectId: 'unkProjectId',
    structId: 'unkStructId'
  }).then((struct: interfaces.Struct) => {

    const desiredError0Lines: interfaces.ErrorLine[] = [
      { line: 3, name: 'e68.view', path: 'e68.view' },
    ];

    expect(struct.errors[0].lines).toEqual(expect.arrayContaining(desiredError0Lines));
    expect(struct.errors[0].title).toEqual(`fields is not a List`);
    expect(struct.errors[0].message).toEqual(`fields must be a List of objects`);
  });
});
