import { AmError } from '../../../src/barrels/am-error';
import { ApStruct } from '../../../src/barrels/ap-struct';
import { api } from '../../../src/barrels/api';
import { interfaces } from '../../../src/barrels/interfaces';

//

// yarn jest test/errors/01_yaml/e119_wrong_hidden.test.ts
jest.setTimeout(30000);
test('testName', () => {
  expect.assertions(4);

  return ApStruct.rebuildStruct({
    dir: 'test/errors/01_yaml/e119',
    weekStart: api.ProjectWeekStartEnum.Monday,
    connection: api.ProjectConnectionEnum.BigQuery,
    bqProject: 'flow-1202',
    projectId: 'unkProjectId',
    structId: 'unkStructId'
  }).then((struct: interfaces.Struct) => {
    const desiredError0Lines: interfaces.ErrorLine[] = [
      { line: 3, name: 'e119.dashboard', path: 'e119.dashboard' }
    ];

    const desiredError1Lines: interfaces.ErrorLine[] = [
      { line: 2, name: 'e119m.model', path: 'e119m.model' }
    ];

    expect(struct.errors[0].title).toEqual(`wrong hidden`);
    expect(struct.errors[0].message).toEqual(
      `parameter "hidden:" must be 'true' or 'false' if specified`
    );
    expect(struct.errors[0].lines).toEqual(
      expect.arrayContaining(desiredError0Lines)
    );
    expect(struct.errors[1].lines).toEqual(
      expect.arrayContaining(desiredError1Lines)
    );
  });
});
