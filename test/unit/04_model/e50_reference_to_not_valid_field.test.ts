import { AmError } from '../../../src/barrels/am-error';
import { ApStruct } from '../../../src/barrels/ap-struct';
import { api } from '../../../src/barrels/api';
import { interfaces } from '../../../src/barrels/interfaces';


//

// yarn jest test/unit/04_model/e50_reference_to_not_valid_field.test.ts
jest.setTimeout(30000); test('testName', () => {
  expect.assertions(3);

  return ApStruct.rebuildStruct({
    dir: 'test/unit/04_model/e50',
    weekStart: api.ProjectWeekStartEnum.Monday,
    bqProject: 'flow-1202',
    projectId: 'unkProjectId',
    structId: 'unkStructId'
  }).then((struct: interfaces.Struct) => {

    const desiredError0Lines: interfaces.ErrorLine[] = [
      { line: 11, name: 'e50m.model', path: 'e50m.model' },
    ];

    expect(struct.errors[1].lines).toEqual(expect.arrayContaining(desiredError0Lines));
    expect(struct.errors[1].title).toEqual(`reference to not valid field`);
    expect(struct.errors[1].message).toEqual(`field "dim1" is missing or not valid`);
  });
});
