import { AmError } from '../../../src/barrels/am-error';
import { ApStruct } from '../../../src/barrels/ap-struct';
import { api } from '../../../src/barrels/api';
import { interfaces } from '../../../src/barrels/interfaces';

//

// yarn jest test/unit/01_yaml/e002_duplicate_file_names.test.ts
jest.setTimeout(30000);
test('testName', () => {
  expect.assertions(3);

  return ApStruct.rebuildStruct({
    dir: 'test/unit/01_yaml/e2',
    weekStart: api.ProjectWeekStartEnum.Monday,
    bqProject: 'flow-1202',
    projectId: 'unkProjectId',
    structId: 'unkStructId'
  }).then((struct: interfaces.Struct) => {
    const desiredError0Lines: interfaces.ErrorLine[] = [
      { line: 0, name: 'e2.view', path: 'nested___e2.view' },
      { line: 0, name: 'e2.view', path: 'e2.view' },
      { line: 0, name: 'e2.view', path: 'nested___nested2___e2.view' }
    ];

    expect(struct.errors[0].lines).toEqual(
      expect.arrayContaining(desiredError0Lines)
    );
    expect(struct.errors[0].title).toEqual(`duplicate file names`);
    expect(struct.errors[0].message).toEqual(
      `BlockML file names should be unique across all folders. Found duplicate e2.view files`
    );
  });
});
