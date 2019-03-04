import { AmError } from '../../../src/barrels/am-error';
import { ApStruct } from '../../../src/barrels/ap-struct';
import { api } from '../../../src/barrels/api';
import { interfaces } from '../../../src/barrels/interfaces';


//

// yarn jest test/unit/02_field/e216_missing_percentile.test.ts
jest.setTimeout(30000); test('testName', () => {
  expect.assertions(3);

  return ApStruct.rebuildStruct({
    dir: 'test/unit/02_field/e216',
    weekStart: api.ProjectWeekStartEnum.Monday,
    bqProject: 'flow-1202',
    projectId: 'unkProjectId',
    structId: 'unkStructId'
  }).then((struct: interfaces.Struct) => {

    const desiredError0Lines: interfaces.ErrorLine[] = [
      { line: 6, name: 'e216.view', path: 'e216.view' },
    ];

    expect(struct.errors[0].lines).toEqual(expect.arrayContaining(desiredError0Lines));
    expect(struct.errors[0].title).toEqual(`missing percentile`);
    expect(struct.errors[0].message).toEqual(
      `parameter "percentile" is required for measure of type percentile_by_key`);
  });
});
