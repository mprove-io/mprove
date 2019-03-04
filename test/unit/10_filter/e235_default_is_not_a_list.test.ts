import { AmError } from '../../../src/barrels/am-error';
import { ApStruct } from '../../../src/barrels/ap-struct';
import { api } from '../../../src/barrels/api';
import { interfaces } from '../../../src/barrels/interfaces';


//

// yarn jest test/unit/10_filter/e235_default_is_not_a_list.test.ts
jest.setTimeout(30000); test('testName', () => {
  expect.assertions(3);

  return ApStruct.rebuildStruct({
    dir: 'test/unit/10_filter/e235',
    weekStart: api.ProjectWeekStartEnum.Monday,
    bqProject: 'flow-1202',
    projectId: 'unkProjectId',
    structId: 'unkStructId'
  }).then((struct: interfaces.Struct) => {

    const desiredError0Lines: interfaces.ErrorLine[] = [
      { line: 6, name: 'e235_one.view', path: 'e235_one.view' },
    ];

    expect(struct.errors[0].lines).toEqual(expect.arrayContaining(desiredError0Lines));
    expect(struct.errors[0].title).toEqual(`default is not a List`);
    expect(struct.errors[0].message).toEqual(
      `"default:" must be a List with element(s) inside like:
- 'filter expression'
- 'filter expression'`);
  });
});