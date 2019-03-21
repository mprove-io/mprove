import { AmError } from '../../../src/barrels/am-error';
import { ApStruct } from '../../../src/barrels/ap-struct';
import { api } from '../../../src/barrels/api';
import { interfaces } from '../../../src/barrels/interfaces';

//

// yarn jest test/errors/04_model/e15_too_many_from_view.test.ts
jest.setTimeout(30000);
test('testName', () => {
  expect.assertions(3);

  return ApStruct.rebuildStruct({
    dir: 'test/errors/04_model/e15',
    weekStart: api.ProjectWeekStartEnum.Monday,
    bqProject: 'flow-1202',
    projectId: 'unkProjectId',
    structId: 'unkStructId'
  }).then((struct: interfaces.Struct) => {
    const desiredError0Lines: interfaces.ErrorLine[] = [
      { line: 3, name: 'e15m.model', path: 'e15m.model' },
      { line: 4, name: 'e15m.model', path: 'e15m.model' },
      { line: 5, name: 'e15m.model', path: 'e15m.model' }
    ];

    expect(struct.errors[0].lines).toEqual(
      expect.arrayContaining(desiredError0Lines)
    );
    expect(struct.errors[0].title).toEqual(`too many from_view`);
    expect(struct.errors[0].message).toEqual(
      `model must have only one Join with 'from_view' parameter`
    );
  });
});
