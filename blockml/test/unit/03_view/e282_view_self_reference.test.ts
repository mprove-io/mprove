import { AmError } from '../../../src/barrels/am-error';
import { ApStruct } from '../../../src/barrels/ap-struct';
import { api } from '../../../src/barrels/api';
import { interfaces } from '../../../src/barrels/interfaces';

//

// yarn jest test/unit/03_view/e282_view_self_reference.test.ts
jest.setTimeout(30000);
test('testName', () => {
  expect.assertions(3);

  return ApStruct.rebuildStruct({
    dir: 'test/unit/03_view/e282',
    weekStart: api.ProjectWeekStartEnum.Monday,
    bqProject: 'flow-1202',
    projectId: 'unkProjectId',
    structId: 'unkStructId'
  }).then((struct: interfaces.Struct) => {
    const desiredError0Lines: interfaces.ErrorLine[] = [
      { line: 2, name: 'e282.view', path: 'e282.view' }
    ];

    expect(struct.errors[0].lines).toEqual(
      expect.arrayContaining(desiredError0Lines)
    );
    expect(struct.errors[0].title).toEqual(`view self reference`);
    expect(struct.errors[0].message).toEqual(
      `derived_table contains reference to "e282"`
    );
  });
});
