import { AmError } from '../../../src/barrels/am-error';
import { ApStruct } from '../../../src/barrels/ap-struct';
import { api } from '../../../src/barrels/api';
import { interfaces } from '../../../src/barrels/interfaces';

//

// yarn jest test/errors/01_yaml/e120_unexpected_list.test.ts
jest.setTimeout(30000);
test('testName', () => {
  expect.assertions(5);

  return ApStruct.rebuildStruct({
    dir: 'test/errors/01_yaml/e120',
    weekStart: api.ProjectWeekStartEnum.Monday,
    connection: api.ProjectConnectionEnum.BigQuery,
    bqProject: 'flow-1202',
    projectId: 'unkProjectId',
    structId: 'unkStructId'
  }).then((struct: interfaces.Struct) => {
    const desiredError0Lines: interfaces.ErrorLine[] = [
      { line: 3, name: 'e120.dashboard', path: 'e120.dashboard' }
    ];

    const desiredError1Lines: interfaces.ErrorLine[] = [
      { line: 3, name: 'e120_one.view', path: 'e120_one.view' }
    ];

    const desiredError2Lines: interfaces.ErrorLine[] = [
      { line: 2, name: 'e120m.model', path: 'e120m.model' }
    ];

    expect(struct.errors[0].title).toEqual(`unexpected List`);
    expect(struct.errors[0].message).toEqual(
      `parameter "description" must have a single value`
    );
    expect(struct.errors[0].lines).toEqual(
      expect.arrayContaining(desiredError0Lines)
    );

    expect(struct.errors[1].lines).toEqual(
      expect.arrayContaining(desiredError1Lines)
    );
    expect(struct.errors[2].lines).toEqual(
      expect.arrayContaining(desiredError2Lines)
    );
  });
});
