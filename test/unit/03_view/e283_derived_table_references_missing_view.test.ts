import { AmError } from '../../../src/barrels/am-error';
import { ApStruct } from '../../../src/barrels/ap-struct';
import { api } from '../../../src/barrels/api';
import { interfaces } from '../../../src/barrels/interfaces';

//

// yarn jest test/unit/03_view/e283_derived_table_references_missing_view.test.ts
jest.setTimeout(30000);
test('testName', () => {
  expect.assertions(3);

  return ApStruct.rebuildStruct({
    dir: 'test/unit/03_view/e283',
    weekStart: api.ProjectWeekStartEnum.Monday,
    bqProject: 'flow-1202',
    projectId: 'unkProjectId',
    structId: 'unkStructId'
  }).then((struct: interfaces.Struct) => {
    const desiredError0Lines: interfaces.ErrorLine[] = [
      { line: 2, name: 'e283.view', path: 'e283.view' }
    ];

    expect(struct.errors[0].lines).toEqual(
      expect.arrayContaining(desiredError0Lines)
    );
    expect(struct.errors[0].title).toEqual(
      `derived_table references missing view`
    );
    expect(struct.errors[0].message).toEqual(
      `derived_table contains reference to missing view "unk"`
    );
  });
});
