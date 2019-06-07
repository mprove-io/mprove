import { AmError } from '../../../src/barrels/am-error';
import { ApStruct } from '../../../src/barrels/ap-struct';
import { api } from '../../../src/barrels/api';
import { interfaces } from '../../../src/barrels/interfaces';

//

// yarn jest test/errors/01_yaml/e121_unexpected_hash.test.ts
jest.setTimeout(30000);
test('testName', () => {
  expect.assertions(5);

  return ApStruct.rebuildStruct({
    dir: 'test/errors/01_yaml/e121',
    weekStart: api.ProjectWeekStartEnum.Monday,
    connection: api.ProjectConnectionEnum.BigQuery,
    bqProject: 'flow-1202',
    projectId: 'unkProjectId',
    structId: 'unkStructId'
  }).then((struct: interfaces.Struct) => {
    const desiredError0Lines: interfaces.ErrorLine[] = [
      { line: 3, name: 'e121.dashboard', path: 'e121.dashboard' }
    ];

    const desiredError1Lines: interfaces.ErrorLine[] = [
      { line: 3, name: 'e121_one.view', path: 'e121_one.view' }
    ];

    const desiredError2Lines: interfaces.ErrorLine[] = [
      { line: 2, name: 'e121m.model', path: 'e121m.model' }
    ];

    expect(struct.errors[0].title).toEqual(`unexpected Hash`);
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
